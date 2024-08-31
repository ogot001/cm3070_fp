import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import collections from '../../../formFields.mjs'; // Adjust the path based on your file structure
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function Record() {
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const params = useParams();
  const navigate = useNavigate();

  // Extract the collection name from the URL params
  const collectionName = params.collection || 'records'; // Default to 'records' if not specified

  // Find the collection fields from collections
  const collection = collections.find(c => c.name === collectionName);
  const formFields = collection ? collection.fields : [];

  useEffect(() => {
    async function fetchData() {
      const id = params.id?.toString() || undefined;
      if (!id) return;
      setIsNew(false);
      try {
        const response = await fetch(`http://localhost:5050/${collectionName}/${id}`);
        if (!response.ok) {
          throw new Error(`An error has occurred: ${response.statusText}`);
        }
        const record = await response.json();
        formik.setValues(record);
      } catch (error) {
        console.error(error.message);
        navigate(`/${collectionName}`); // Redirect to the collection list
      }
    }
    fetchData();
  }, [params.id, navigate, collectionName]);

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
          default:
            break;
        }
      }
      return schema;
    }, {})
  );

  // Adding mobile number validation if exists
  if (formFields.some(field => field[1] === "mobileNumber")) {
    validationSchema["mobileNumber"] = Yup.string()
      .matches(/^\+?[1-9]\d{1,14}$/, "Invalid mobile number")
      .required("Mobile Number is required");
  }

  const formik = useFormik({
    initialValues: formFields.reduce((values, field) => {
      values[field[1]] = "";
      return values;
    }, {}),
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      console.log("Submitted values:", values); // Log the submitted values

      try {
        let response;
        if (isNew) {
          response = await fetch(`http://localhost:5050/${collectionName}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          });
        } else {
          response = await fetch(`http://localhost:5050/${collectionName}/${params.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          });
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('A problem occurred adding or updating a record: ', error);
      } finally {
        setIsEditing(false);
      }
    },
  });

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const isFieldEditable = () => isEditing;

  async function onDelete() {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await fetch(`http://localhost:5050/${collectionName}/${params.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        navigate(`/${collectionName}`);
      } catch (error) {
        console.error('A problem occurred deleting the record: ', error);
      }
    }
  }

  return (
    <>
      <h3 className="text-lg font-semibold p-4">
        {isNew ? `Create ${collectionName.slice(0, -1)}` : `Update ${collectionName.slice(0, -1)}`} Record
      </h3>
      <form onSubmit={formik.handleSubmit} className="border rounded-lg overflow-hidden p-4">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-slate-900/10 pb-12 md:grid-cols-2">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 ">
            {Array.isArray(formFields) && formFields.map((field) => {
              if (Array.isArray(field)) {
                const [label, fieldName, type, compulsory, options] = field;
                return (
                  <div key={fieldName} className="sm:col-span-4">
                    <label htmlFor={fieldName} className="block text-sm font-medium leading-6 text-slate-900">
                      {label}
                    </label>
                    <div className="mt-2">
                      {type === "radio" ? (
                        options.map((option) => (
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
                                console.log(`Updated ${fieldName}:`, e.target.value); // Log each update
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
                            console.log(`Updated ${fieldName}:`, e.target.value); // Log each update
                          }}
                          onBlur={formik.handleBlur}
                          required={compulsory}
                          disabled={!isFieldEditable()}
                        >
                          <option value="">Select {label}</option>
                          {options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : type === "phone" ? (
                        <PhoneInput
                          country={'us'}
                          value={formik.values[fieldName]}
                          onChange={(phone) => {
                            formik.setFieldValue(fieldName, phone);
                            console.log(`Updated ${fieldName}:`, phone); // Log each update
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
                          value={formik.values[fieldName]}
                          onChange={(e) => {
                            formik.handleChange(e);
                            console.log(`Updated ${fieldName}:`, e.target.value); // Log each update
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
          {isEditing ? (
            <input
              type="submit"
              value="Save Changes"
              className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer"
            />
          ) : (
            <button
              type="button"
              onClick={toggleEdit}
              className={`inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-green-600 text-white hover:bg-green-700 h-9 rounded-md px-3 cursor-pointer`}
            >
              Edit
            </button>
          )}
          {!isNew && (
            <button
              type="button"
              onClick={onDelete}
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
