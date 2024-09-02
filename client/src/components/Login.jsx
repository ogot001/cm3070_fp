import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  // State variables to manage email, OTP, whether the OTP was sent, and any error messages
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Function to handle sending OTP to the user's email
  const handleSendOtp = async () => {
    try {
      const response = await fetch('http://localhost:5050/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // Check if the response is not successful
      if (!response.ok) {
        throw new Error('Failed to send OTP. Please try again.');
      }

      // If OTP is sent successfully, update the state
      setOtpSent(true);
      setError(''); // Clear any previous errors
    } catch (err) {
      // If there's an error, set the error message
      setError(err.message);
    }
  };

  // Function to handle verifying the OTP entered by the user
  const handleVerifyOtp = async () => {
    try {
      const response = await fetch('http://localhost:5050/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      // Check if the response is not successful
      if (!response.ok) {
        throw new Error('Invalid OTP. Please try again.');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token); // Store the token in localStorage
      console.log("Token saved to localStorage:", data.token); // Debug log
      localStorage.setItem('token', data.token); // Store the token in localStorage
      localStorage.setItem('email', email); // Store the email in localStorage
      console.log("Token saved to localStorage:", data.token); // Debug log
      console.log("Email saved to localStorage:", email); // Debug log
      onLogin(); // Call the onLogin function to set authentication state
      navigate('/'); // Navigate to the home page after successful login
    } catch (err) {
      // If there's an error, set the error message
      console.error("Error during OTP verification:", err.message); // Debug log
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-sm">
        {/* Login Form Heading */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Login</h2>
        
        {/* Email Input Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={otpSent} // Disable email input if OTP has already been sent
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            placeholder="Enter your email"
          />
        </div>

        {/* OTP Input Field (only shown after OTP is sent) */}
        {otpSent && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">OTP:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              placeholder="Enter the OTP"
            />
          </div>
        )}

        {/* Button to send OTP or verify OTP depending on state */}
        <div>
          <button
            onClick={otpSent ? handleVerifyOtp : handleSendOtp}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {otpSent ? 'Verify OTP' : 'Send OTP'}
          </button>
        </div>

        {/* Display error message if there is any */}
        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
