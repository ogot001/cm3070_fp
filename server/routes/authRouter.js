import express from 'express';
import { users } from '../../users.mjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = express.Router();

const otps = {}; // Temporary store for OTPs

// Generate JWT Token
const generateToken = (email) => {
  const payload = { email };
  return jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
};

// Middleware to authenticate the token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Function to create nodemailer transporter based on environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-mail.outlook.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-outlook-email@outlook.com', // Your email
      pass: process.env.SMTP_PASS || 'your-outlook-password', // Your email password
    },
  });
};

// Endpoint to request OTP
router.post('/request-otp', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
  otps[email] = otp;

  // Log OTP generation
  console.log(`Generated OTP for ${email}: ${otp}`);

  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_USER || 'your-outlook-email@outlook.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send OTP' });
    }
    console.log('Email sent:', info.response);
    res.status(200).json({ message: 'OTP sent successfully' });
  });
});

// Endpoint to verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otps[email] === otp) {
    delete otps[email]; // Remove OTP after verification
    const token = generateToken(email);
    res.status(200).json({ message: 'Login successful', token });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
});

export const authRouter = router;
