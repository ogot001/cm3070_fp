// const formFields = [
//     ["Name", "name", "text", true],
//     ["Date of Birth", "dob", "date", false],
//     ["IC Number", "icNumber", "text", false],
//     ["Email", "email", "email", false],
//     ["Mobile Number", "mobileNumber", "phone", false],
//     ["Position", "position", "text", false],
//     ["Level", "level", "dropdown", false, ["Intern", "Junior", "Senior"]],
//     ["Department", "department", "dropdown", false, ["HR", "Engineering", "Marketing"]],
//   ];
  
// export default formFields;

export const collections = [
  {
    name: "records",
    fields: [
      ["Name", "name", "text", true],
      ["Date of Birth", "dob", "date", false],
      ["IC Number", "icNumber", "text", false],
      ["Email", "email", "email", false],
      ["Mobile Number", "mobileNumber", "phone", false],
      ["Position", "position", "text", false],
      ["Level", "level", "dropdown", false, ["Intern", "Junior", "Senior"]],
    ]
  },
  {
    name: "companies",
    fields: [
      ["Company Name", "companyName", "text", true],
      ["Industry", "industry", "dropdown", false, ["Tech", "Finance", "Healthcare"]],
      ["Location", "location", "text", false],
      ["Contact Email", "contactEmail", "email", false],
      ["Contact Phone", "contactPhone", "phone", false],
    ]
  }
  // Add more collections as needed
];

// This ensures that `collections` is the default export
export default collections;