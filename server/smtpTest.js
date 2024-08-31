import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

console.log(process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_USER);

// Create a transporter object using your SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Set to true if you're using port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Set up the email options
const mailOptions = {
  from: process.env.SMTP_USER, // Sender address
  to: 'ogot001@mymail.sim.edu.sg', // Recipient address
  subject: 'Test Email', // Subject line
  text: 'This is a test email.', // Plain text body
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log('Error:', error);
  }
  console.log('Email sent:', info.response);
});
