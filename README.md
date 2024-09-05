## MERN Stack Dynamic Form Web Application Project

This project is a dynamic form management system built using the MERN stack (MongoDB, Express.js, React, and Node.js). It allows users to dynamically generate forms, manage data, and perform CRUD operations with customizable templates.

### Table of Contents 
- Installation
- Configuration
- Running the Project
- Folder Structure
- Environment Variables
- Authentication
- API Endpoints
- Troubleshooting
- Contributing
- License

### Installation
#### Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (v14.x or higher)
- MongoDB (v4.x or higher)

1. Clone the Repository & Install Dependencies
2. Navigate to the backend directory (server) and install the required dependencies in the terminal (powershell)
   ```
   cd server
   npm install
   ```
3. Navigate to the client directory and install the required dependencies:
   ```
   cd ../client
   npm install
   ```
4. Configure the environment variables for the server, create a .env file in the server directory and configure the following variables:
   ```
   PORT=5050
   MONGODB_URI=mongodb://localhost:27017/your-database-name
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_USER=your-outlook-email@outlook.com
   SMTP_PASS=your-outlook-password
   ```
5. Ensure that MongoDB is running locally or point MONGODB_URI to your MongoDB Atlas cluster if you're using a hosted database.
6. Configure Form Fields and Users
7. Form Fields Configuration: Define the form fields for each collection in the formFields.mjs file located in the main directory.
```javascript
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
  // Add more collections as needed
];
```
8. Users Configuration:  Create a users.mjs file in the main directory with formFields.mjs like below:
```javascript
export const users = [
	// ***example***
	// { 
	//     email: "admin@example.com", 
	//     rights: { 
	//         new: true, 
	//         edit: true, 
	//         delete: true 
	//     }
	// },
	// Add more users as needed
];
```
### Running the Project 
1. Start the Express server from the server directory in the terminal
        cd server
        npm start
2. Start the React development server from the client directory in another terminal
        cd client
        npm start
### Folder structure
This is what your project should look like:
```bash
your-repo-name/
├── client/                  # React Frontend
│   ├── public/              # Public assets
│   ├── src/                 # Source files
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── App.jsx          # Main App component
│   │   ├── index.jsx        # Entry point
│   │   ├── formFields.mjs   # Form fields configuration
│   │   └── ...
│   ├── package.json         # Frontend dependencies
│   └── ...
├── server/                  # Express Backend
│   ├── db/                  # Database connection files
│   ├── routes/              # Express routes
│   ├── auth/                # Authentication logic
│   ├── users.mjs            # Users configuration
│   ├── server.js            # Server entry point
│   ├── .env                 # Environment variables
│   ├── package.json         # Backend dependencies
│   └── ...
└── README.md                # Project documentation
```
### Authentication
Authentication is implemented using JWT and OTP. Users defined in users.mjs are allowed to log in using their email. An OTP is sent to the user's email, and upon successful verification, a JWT token is issued.

### API Endpoints
Here are some key API endpoints available in this project:
- Request OTP: POST /auth/request-otp
- Verify OTP: POST /auth/verify-otp
- Create Record: POST /:collectionName
- Fetch Records: GET /:collectionName
- Update Record: PATCH /:collectionName/:id
- Delete Record: DELETE /:collectionName/:id
You can test these endpoints using tools like Postman.

### Troubleshooting
- Common Issues:
	- Ensure MongoDB is running and the connection string in the .env file is correct.
	- Check for any missing environment variables.
	- Verify that all required dependencies are installed using npm install.
- Logs:
	- Check server logs for errors or warnings by reviewing the terminal output where the server is running.
	- Use console.log for debugging in both the client and server.

### Contributing
Contributions are welcome! Feel free to submit a pull request or open an issue to discuss improvements.
