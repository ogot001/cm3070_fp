import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import collections from '../../../formFields.mjs'; // Adjust the path based on your file structure

// Component for rendering a single record row
const Record = ({ record, collectionName }) => {
  // Find the collection configuration based on the collection name
  const collection = collections.find(c => c.name === collectionName);

  return (
    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
      {/* Map through the fields specified in search_fields for this collection */}
      {collection.search_fields.map((field) => {
        // Find the field configuration for each search field
        const fieldInfo = collection.fields.find(f => f[1] === field);
        // Determine if this field is a join field (linked to another collection)
        const isJoin = fieldInfo && fieldInfo[2] === "join";
        let fieldValue;

        if (isJoin) {
          // If it's a join field, split the join configuration to get the collection and display field
          const [joinCollection, joinField] = fieldInfo[4].split(';');
          // Fetch the related field value from the joined data or fall back to the original field
          fieldValue = record[`${field}Details`]?.[joinField] || record[field];
        } else {
          // For non-join fields, use the field value directly from the record
          fieldValue = record[field];
        }

        return (
          <td key={field} className="p-4 align-middle">
            {/* Link the row to the edit page for the specific record */}
            <Link to={`/${collectionName}/edit/${record._id}`} className="block">
              {fieldValue}
            </Link>
          </td>
        );
      })}
    </tr>
  );
};

export default function RecordList({ collectionName }) {
  const [records, setRecords] = useState([]); // State to hold the list of records
  const [searchCriteria, setSearchCriteria] = useState({}); // State to hold the search criteria

  // Find the collection configuration based on the collection name
  const collection = collections.find(c => c.name === collectionName);
  const searchFields = collection ? collection.search_fields : [];

  // Fetch records from the server when the component mounts or collectionName changes
  useEffect(() => {
    async function getRecords() {
      const response = await fetch(`http://localhost:5050/${collectionName}/`);
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const records = await response.json();
      setRecords(records); // Set the fetched records to state
    }
    getRecords();
  }, [collectionName]);

  // Filter records based on the search criteria entered by the user
  const filteredRecords = records.filter((record) =>
    searchFields.every((field) => {
      // Check if the field is a join field
      const fieldInfo = collection.fields.find(f => f[1] === field);
      const isJoin = fieldInfo && fieldInfo[2] === "join";
      let fieldValue;

      if (isJoin) {
        // Get the related field value from the joined data or use the original field
        const [joinCollection, joinField] = fieldInfo[4].split(';');
        fieldValue = record[`${field}Details`]?.[joinField] || record[field];
      } else {
        // For non-join fields, use the field value directly from the record
        fieldValue = record[field];
      }

      // Filter records where the field value includes the search criteria
      return fieldValue
        ?.toString()
        .toLowerCase()
        .includes(searchCriteria[field]?.toLowerCase() || "");
    })
  );

  // Handle search input changes and update the search criteria state
  const handleSearchChange = (field, value) => {
    setSearchCriteria((prev) => ({ ...prev, [field]: value }));
  };

  // Find the next collection to link to (used for navigation between collections)
  const currentCollectionIndex = collections.findIndex(c => c.name === collectionName);
  const nextCollection = collections[(currentCollectionIndex + 1) % collections.length];

  // Render the list of filtered records
  function recordList() {
    return filteredRecords.map(record => (
      <Record record={record} key={record._id} collectionName={collectionName} />
    ));
  }

  return (
    <>
      <div className="flex justify-between items-center p-4">
        {/* Display the collection name as a heading */}
        <h3 className="text-lg font-semibold">
          {collectionName.charAt(0).toUpperCase() + collectionName.slice(1)} Records
        </h3>
        {/* Link to the next collection in the list */}
        <Link
          to={`/${nextCollection.name}`}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Go to {nextCollection.name.charAt(0).toUpperCase() + nextCollection.name.slice(1)}
        </Link>
      </div>
      <div className="p-4">
        {/* Link to create a new record */}
        <Link
          to={`/${collectionName}/create`}
          className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md"
        >
          New
        </Link>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&amp;_tr]:border-b">
            <tr className="border-b">
              {/* Render the search inputs inline with the corresponding columns */}
              {searchFields.map((field) => {
                const fieldInfo = collection.fields.find(f => f[1] === field);
                const label = fieldInfo ? fieldInfo[0] : field;
                return (
                  <th key={field} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    <input
                      type="text"
                      placeholder={`Search ${label}`} // Use the label for the placeholder
                      value={searchCriteria[field] || ''}
                      onChange={(e) => handleSearchChange(field, e.target.value)}
                      className="w-full border rounded p-2"
                    />
                  </th>
                );
              })}
            </tr>
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                {/* Render table headers using the labels from formFields.mjs */}
                {searchFields.map((field) => {
                  const fieldInfo = collection.fields.find(f => f[1] === field);
                  const label = fieldInfo ? fieldInfo[0] : field;
                  return (
                    <th
                      key={field}
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                    >
                      {label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="[&amp;_tr:last-child]:border-0">
              {/* Render the list of records */}
              {recordList()}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
