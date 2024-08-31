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

// const standardFields = [
//   ["Created On", "created_on", "date", false],
//   ["Created By", "created_by", "text", false],
//   ["Modified On", "modified_on", "date", false],
//   ["Modified By", "modified_by", "text", false],
//   ["Deleted On", "deleted_on", "date", false],
//   ["Deleted By", "deleted_by", "text", false],
//   ["Deleted", "deleted", "integer", false], // 0 = not deleted, 1 = deleted
// ];

export const collections = [
  // ***example***
  // { 
  //   name: "",
  //   fields: [
  //     ["label", "field_name", "type" (text, date, phone, email, dropdown, join), "compulsory", "options/collection + field to display"],
  //   ],
  //   search_fields: ["", "", ""]
  // },
  {
    name: "employees",
    fields: [
      ["Name", "name", "text", true],
      ["Date of Birth", "dob", "date", false],
      ["IC No.", "ic_no", "text", false],
      ["Mobile Number", "mobile_no", "phone", false],
      ["Email", "email", "email", false],
      ["Position", "position", "dropdown", false, ["Intern", "Junior", "Senior"]],
      ["Department", "department", "join", false, "departments;department"],  // This line adds the join to the departments collection
    ],
    search_fields: ["name", "mobile_no", "email", "position", "department"] // Specify search fields to be displayed
  },
  {
    name: "departments",
    fields: [
      ["Department", "department", "dropdown", false, ["Tech", "Finance", "Healthcare"]],
      ["Location", "location", "text", false],
      ["Email", "email", "email", false],
      ["Phone", "phone", "phone", false],
    ],
    search_fields: ["department", "location"] 
  }
  // Add more collections as needed
];
// .map(collection => ({
//   ...collection,
//   fields: [...collection.fields, ...standardFields]
// }));

// This ensures that `collections` is the default export
export default collections;