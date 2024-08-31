import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      const response = await fetch('http://localhost:5050/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP. Please try again.');
      }

      setOtpSent(true);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch('http://localhost:5050/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
  
      if (!response.ok) {
        throw new Error('Invalid OTP. Please try again.');
      }
  
      const data = await response.json();
      localStorage.setItem('token', data.token); // Store the token in localStorage
      console.log("Token saved to localStorage:", data.token); // Debug log
      onLogin(); // Call the onLogin function to set authentication state
      navigate('/'); // Navigate to the home page after successful login
    } catch (err) {
      console.error("Error during OTP verification:", err.message); // Debug log
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Login</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={otpSent}
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            placeholder="Enter your email"
          />
        </div>
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
        <div>
          <button
            onClick={otpSent ? handleVerifyOtp : handleSendOtp}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {otpSent ? 'Verify OTP' : 'Send OTP'}
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
