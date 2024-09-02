# cm3070_fp
MERN Stack Dynamic Form Project
This project is a dynamic form management system built using the MERN stack (MongoDB, Express.js, React, and Node.js). It allows users to dynamically generate forms, manage data, and perform CRUD operations with customizable templates.

Table of Contents
Installation
Configuration
Running the Project
Folder Structure
Environment Variables
Authentication
API Endpoints
Troubleshooting
Installation
Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v14.x or higher)
MongoDB (v4.x or higher)
Git
Clone the Repository
bash
Copy code
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
Install Dependencies
Server (Backend)
Navigate to the backend directory and install the required dependencies:

bash
Copy code
cd server
npm install
Client (Frontend)
Navigate to the client directory and install the required dependencies:

bash
Copy code
cd ../client
npm install
Configuration
Environment Variables
You need to set up environment variables for the server. Create a .env file in the server directory and configure the following variables:

bash
Copy code
PORT=5050
MONGODB_URI=mongodb://localhost:27017/your-database-name
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-outlook-email@outlook.com
SMTP_PASS=your-outlook-password
Ensure that MongoDB is running locally or point MONGODB_URI to your MongoDB Atlas cluster if you're using a hosted database.

Configure Form Fields and Users
Form Fields Configuration: Define the form fields for each collection in the formFields.mjs file located in the client/src directory.
Users Configuration: Add users and their rights (create, edit, delete) in the users.mjs file located in the server directory.
Running the Project
Running the Server
Start the Express server from the server directory:

bash
Copy code
cd server
npm start
Running the Client
Start the React development server from the client directory:

bash
Copy code
cd ../client
npm start
The client will be accessible at http://localhost:3000, and the API server will be running at http://localhost:5050.

Folder Structure
Here’s a brief overview of the project structure:

bash
Copy code
your-repo-name/
│
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
│
├── server/                  # Express Backend
│   ├── db/                  # Database connection files
│   ├── routes/              # Express routes
│   ├── auth/                # Authentication logic
│   ├── users.mjs            # Users configuration
│   ├── server.js            # Server entry point
│   ├── .env                 # Environment variables
│   ├── package.json         # Backend dependencies
│   └── ...
│
└── README.md                # Project documentation
Environment Variables
Ensure you have configured the environment variables correctly in the .env file as described above.

Authentication
Authentication is implemented using JWT and OTP. Users defined in users.mjs are allowed to log in using their email. An OTP is sent to the user's email, and upon successful verification, a JWT token is issued.

API Endpoints
Here are some key API endpoints available in this project:

Request OTP: POST /auth/request-otp
Verify OTP: POST /auth/verify-otp
Create Record: POST /:collectionName
Fetch Records: GET /:collectionName
Update Record: PATCH /:collectionName/:id
Delete Record: DELETE /:collectionName/:id
You can test these endpoints using tools like Postman.

Troubleshooting
Common Issues:

Ensure MongoDB is running and the connection string in the .env file is correct.
Check for any missing environment variables.
Verify that all required dependencies are installed using npm install.
Logs:

Check server logs for errors or warnings by reviewing the terminal output where the server is running.
Use console.log for debugging in both the client and server.
Contributing
Contributions are welcome! Feel free to submit a pull request or open an issue to discuss improvements.

License
This project is licensed under the MIT License - see the LICENSE file for details.
