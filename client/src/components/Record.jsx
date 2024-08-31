import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import collections from '../../../formFields.mjs'; // Adjust the path based on your file structure
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select"; // Import react-select for combobox functionality

export default function Record({ collectionName }) {
  const [isEditing, setIsEditing] = useState(true); // State to handle editing mode
  const [isNew, setIsNew] = useState(true); // State to handle whether it's a new record
  const [relatedData, setRelatedData] = useState({}); // State to store related data from joins
  const params = useParams();
  const navigate = useNavigate();

  // Get the collection configuration from formFields.mjs based on the collectionName
  const collection = collections.find(c => c.name === collectionName);
  const formFields = collection ? collection.fields : [];

  // If the collection is not found, show an error
  if (!collectionName || !collection) {
    return <h2>Error: Collection not specified or not found</h2>;
  }

  // Fetch related data for join fields (e.g., departments, companies) when the component mounts
  useEffect(() => {
    async function fetchRelatedData() {
      try {
        const token = localStorage.getItem('token'); // Retrieve the JWT token from localStorage
        const fetchPromises = formFields
          .filter(field => field[2] === "join") // Filter fields that require joins
          .map(async ([, , , , joinInfo]) => {
            const [foreignCollection, displayField] = joinInfo.split(';');
            const response = await fetch(`http://localhost:5050/${foreignCollection}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`, // Include the Authorization header with the token
                'Content-Type': 'application/json',
              },
            });
            if (!response.ok) {
              throw new Error(`An error occurred: ${response.statusText}`);
            }
            const data = await response.json();
            // Map the data to only include _id and displayValue (for use in the combobox)
            return { [foreignCollection]: data.map(item => ({ value: item._id, label: item[displayField] })) };
          });

        const result = await Promise.all(fetchPromises);
        const dataMap = result.reduce((acc, cur) => ({ ...acc, ...cur }), {});
        setRelatedData(dataMap); // Store the fetched data in state
      } catch (error) {
        console.error("Error fetching related data:", error);
      }
    }

    fetchRelatedData();
  }, [formFields]);

  // Fetch the existing data if we're editing an existing record
  useEffect(() => {
    async function fetchData() {
      const id = params.id?.toString() || undefined;
      if (!id) return;
      setIsNew(false);
      setIsEditing(false); // Disable editing initially when fetching data
      try {
        const token = localStorage.getItem('token'); // Retrieve the JWT token from localStorage
        const response = await fetch(`http://localhost:5050/${collectionName}/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Include the Authorization header with the token
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`An error has occurred: ${response.statusText}`);
        }
        const record = await response.json();
        formik.setValues(record); // Populate the form with the fetched data
      } catch (error) {
        console.error(error.message);
        navigate(`/${collectionName}`); // Redirect to the collection list on error
      }
    }
    fetchData();
  }, [params.id, navigate, collectionName]);

  // Define validation schema dynamically based on formFields.mjs
  const validationSchema = Yup.object(
    formFields.reduce((schema, field) => {
      if (field[3]) {
        switch (field[2]) {
          case "text":
            schema[field[1]] = Yup.string().required(`${field[0]} is required`);
            break;
          case "email":
            schema[field[1]] = Yup.string()
              .email("Invalid email address")
              .required(`${field[0]} is required`);
            break;
          case "date":
            schema[field[1]] = Yup.date().required(`${field[0]} is required`).nullable();
            break;
          case "radio":
          case "dropdown":
            schema[field[1]] = Yup.string()
              .oneOf(field[4], `Invalid ${field[0].toLowerCase()}`)
              .required(`${field[0]} is required`);
            break;
          case "join":
            schema[field[1]] = Yup.string().required(`${field[0]} is required`);
            break;
          default:
            break;
        }
      }
      return schema;
    }, {})
  );

  // Adding mobile number validation if the field exists
  if (formFields.some(field => field[1] === "mobileNumber")) {
    validationSchema["mobileNumber"] = Yup.string()
      .matches(/^\+?[1-9]\d{1,14}$/, "Invalid mobile number")
      .required("Mobile Number is required");
  }

  const cleanValues = (values) => {
    const cleanedValues = { ...values };
    Object.keys(cleanedValues).forEach(key => {
      if (cleanedValues[key] === '') {
        cleanedValues[key] = null; // Convert empty strings to null
      }
    });
    return cleanedValues;
  };
  
  const formik = useFormik({
    initialValues: formFields.reduce((values, field) => {
      values[field[1]] = "";
      return values;
    }, {}),
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const cleanedValues = cleanValues(values);
      console.log("Submitted values:", cleanedValues);
  
      try {
        const token = localStorage.getItem('token'); // Retrieve the JWT token from localStorage
        let response;
        if (isNew) {
          response = await fetch(`http://localhost:5050/${collectionName}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`, // Include the Authorization header with the token
              "Content-Type": "application/json",
            },
            body: JSON.stringify(cleanedValues),
          });
        } else {
          response = await fetch(`http://localhost:5050/${collectionName}/${params.id}`, {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${token}`, // Include the Authorization header with the token
              "Content-Type": "application/json",
            },
            body: JSON.stringify(cleanedValues),
          });
        }
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setIsEditing(false);
        if (isNew) {
          navigate(`/${collectionName}`); // Redirect to the list after creating a new entry
        }
      } catch (error) {
        console.error('A problem occurred adding or updating a record: ', error);
      }
    },
  });
  

  // Toggle editing mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Handle creation of a new record
  const handleNew = () => {
    formik.resetForm(); // Reset form values to empty
    setIsNew(true); // Set to new entry mode
    setIsEditing(true); // Enable editing
    navigate(`/${collectionName}/create`); // Navigate to the creation form
  };

  // Check if a field is editable based on editing state
  const isFieldEditable = () => isEditing;

  // Handle deletion of a record
  async function onDelete() {
    try {
      const token = localStorage.getItem('token'); // Retrieve the JWT token from localStorage
      const response = await fetch(`http://localhost:5050/${collectionName}/${params.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`, // Include the Authorization header with the token
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      navigate(`/${collectionName}`);
    } catch (error) {
      console.error('A problem occurred deleting the record: ', error);
    }
  }

  return (
    <>
      <h3 className="text-lg font-semibold p-4">
        {isNew ? `${collectionName}: Create` : `${collectionName}: Update`} Record
      </h3>
      <form onSubmit={formik.handleSubmit} className="border rounded-lg overflow-hidden p-4">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-slate-900/10 pb-12 md:grid-cols-2">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 ">
            {Array.isArray(formFields) && formFields.map((field) => {
              if (Array.isArray(field)) {
                const [label, fieldName, type, compulsory, optionsOrJoin] = field;
                const joinInfo = type === "join" ? optionsOrJoin.split(";") : null;

                return (
                  <div key={fieldName} className="sm:col-span-4">
                    <label htmlFor={fieldName} className="block text-sm font-medium leading-6 text-slate-900">
                      {label}
                    </label>
                    <div className="mt-2">
                      {type === "radio" ? (
                        optionsOrJoin.map((option) => (
                          <div key={option} className="flex items-center">
                            <input
                              id={`${fieldName}${option}`}
                              name={fieldName}
                              type="radio"
                              value={option}
                              className="h-4 w-4 border-slate-300 text-slate-600 focus:ring-slate-600 cursor-pointer"
                              checked={formik.values[fieldName] === option}
                              onChange={(e) => {
                                formik.handleChange(e);
                                console.log(`Updated ${fieldName}:`, e.target.value);
                              }}
                              onBlur={formik.handleBlur}
                              disabled={!isFieldEditable()}
                            />
                            <label htmlFor={`${fieldName}${option}`} className="ml-3 block text-sm font-medium leading-6 text-slate-900 mr-4">
                              {option}
                            </label>
                          </div>
                        ))
                      ) : type === "dropdown" ? (
                        <select
                          name={fieldName}
                          id={fieldName}
                          className="block w-full border-0 bg-transparent py-1.5 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                          value={formik.values[fieldName]}
                          onChange={(e) => {
                            formik.handleChange(e);
                            console.log(`Updated ${fieldName}:`, e.target.value);
                          }}
                          onBlur={formik.handleBlur}
                          required={compulsory}
                          disabled={!isFieldEditable()}
                        >
                          <option value="">Select {label}</option>
                          {optionsOrJoin.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : type === "join" ? (
                          <Select
                            name={fieldName}
                            id={fieldName}
                            options={[{ value: '', label: '' }, ...(relatedData[joinInfo[0]] || [])]}
                            value={relatedData[joinInfo[0]]?.find(option => option.value === formik.values[fieldName]) || { value: '', label: '' }}
                            onChange={(selectedOption) => {
                              const valueToSet = selectedOption ? selectedOption.value : '';
                              formik.setFieldValue(fieldName, valueToSet);
                              console.log(`Updated ${fieldName}:`, valueToSet);
                            }}
                            onBlur={formik.handleBlur}
                            isDisabled={!isFieldEditable()}
                            placeholder={`Select ${label}`}
                            className="block w-full"
                          />
                      ) : type === "phone" ? (
                        <PhoneInput
                          country={'us'}
                          value={formik.values[fieldName]}
                          onChange={(phone) => {
                            formik.setFieldValue(fieldName, phone);
                            console.log(`Updated ${fieldName}:`, phone);
                          }}
                          inputProps={{
                            name: fieldName,
                            required: compulsory,
                            autoFocus: true,
                            disabled: !isFieldEditable()
                          }}
                        />
                      ) : (
                        <input
                          type={type}
                          name={fieldName}
                          id={fieldName}
                          className="block w-full border-0 bg-transparent py-1.5 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                          placeholder={label}
                          value={formik.values[fieldName] || ''}
                          onChange={(e) => {
                            formik.handleChange(e);
                            console.log(`Updated ${fieldName}:`, e.target.value);
                          }}
                          onBlur={formik.handleBlur}
                          required={compulsory}
                          disabled={!isFieldEditable()}
                        />
                      )}
                      {formik.touched[fieldName] && formik.errors[fieldName] ? (
                        <div className="text-red-600">{formik.errors[fieldName]}</div>
                      ) : null}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={handleNew}
            className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 h-9 rounded-md px-3 cursor-pointer"
          >
            New
          </button>
          {isEditing ? (
            <input
              type="submit"
              value="Save"
              onClick={(e) => {
                if (!window.confirm("Are you sure you want to save the changes?")) {
                  e.preventDefault();
                }
              }}
              className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer"
            />
          ) : (
            <button
              type="button"
              onClick={toggleEdit}
              className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-green-600 text-white hover:bg-green-700 h-9 rounded-md px-3 cursor-pointer"
            >
              Edit
            </button>
          )}
          {!isNew && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this record?")) {
                  onDelete();
                }
              }}
              className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-red-600 bg-red-600 text-white hover:bg-red-700 h-9 rounded-md px-3 cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </>
  );
}
