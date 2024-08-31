const formFields = [
    ["Name", "name", "text", true],
    ["Date of Birth", "dob", "date", false],
    ["IC Number", "icNumber", "text", false],
    ["Email", "email", "email", false],
    ["Mobile Number", "mobileNumber", "phone", false],
    ["Position", "position", "text", false],
    ["Level", "level", "dropdown", false, ["Intern", "Junior", "Senior"]],
    ["Department", "department", "dropdown", false, ["HR", "Engineering", "Marketing"]],
  ];
  
export default formFields;
  