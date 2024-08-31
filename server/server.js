import express from "express";
import cors from "cors";
import { createRouter } from './routes/generalRouter.js';
import { collections } from '../formFields.mjs';
import { authRouter, authenticateToken } from './routes/authRouter.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

// Public route for login
app.use('/auth', authRouter); // Add the authentication route

// Middleware to protect routes
app.use(authenticateToken); // Protect all routes that come after this line

// Loop through collections and create routes dynamically
collections.forEach(collection => {
  app.use(`/${collection.name}`, createRouter(collection.name, collection.fields));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
