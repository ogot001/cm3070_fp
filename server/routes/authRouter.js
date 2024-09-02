import express from 'express'; // Import express framework
import { users } from '../../users.mjs'; // Import users data
import nodemailer from 'nodemailer'; // Import nodemailer for sending emails
import crypto from 'crypto'; // Import crypto for generating OTPs
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for handling JWT

const router = express.Router(); // Create a new express router instance

const otps = {}; // Temporary store for OTPs, with email as the key and OTP as the value

// Function to generate JWT Token for a given email
const generateToken = (email) => {
  const payload = { email }; // Create a payload containing the user's email
  // Sign and return the token with a 1-hour expiration time
  return jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
};

// Middleware function to authenticate the JWT token
export const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // If no token is provided, return a 401 Unauthorized response
  if (!token) return res.sendStatus(401);

  // Verify the token using the secret key
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    // If verification fails, return a 403 Forbidden response
    if (err) return res.sendStatus(403);
    // If verification is successful, attach the user info to the request object
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  });
};

// Function to create a nodemailer transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-mail.outlook.com', // SMTP server host
    port: process.env.SMTP_PORT || 587, // SMTP server port
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-outlook-email@outlook.com', // SMTP username
      pass: process.env.SMTP_PASS || 'your-outlook-password', // SMTP password
    },
  });
};

// Endpoint to request an OTP
router.post('/request-otp', (req, res) => {
  const { email } = req.body; // Extract email from the request body
  const user = users.find(u => u.email === email); // Find the user by email
  if (!user) {
    return res.status(404).json({ message: 'User not found' }); // Return 404 if user is not found
  }

  const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
  otps[email] = otp; // Store the OTP with the user's email as the key

  // Log OTP generation for debugging
  console.log(`Generated OTP for ${email}: ${otp}`);

  const transporter = createTransporter(); // Create a nodemailer transporter

  const mailOptions = {
    from: process.env.SMTP_USER || 'your-outlook-email@outlook.com', // Sender's email address
    to: email, // Recipient's email address
    subject: 'Your OTP Code', // Email subject
    text: `Your OTP code is ${otp}`, // Email body containing the OTP
  };

  // Send the OTP email using nodemailer
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error); // Log any errors that occur during sending
      return res.status(500).json({ message: 'Failed to send OTP' }); // Return 500 if email sending fails
    }
    console.log('Email sent:', info.response); // Log successful email sending
    res.status(200).json({ message: 'OTP sent successfully' }); // Return success response
  });
});

// Endpoint to verify the OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body; // Extract email and OTP from the request body
  if (otps[email] === otp) { // Check if the provided OTP matches the stored OTP
    delete otps[email]; // Remove the OTP after successful verification
    const token = generateToken(email); // Generate a JWT token for the user
    res.status(200).json({ message: 'Login successful', token }); // Return success response with the token
  } else {
    res.status(400).json({ message: 'Invalid OTP' }); // Return 400 if OTP is invalid
  }
});

export const authRouter = router; // Export the router for use in the main server file
