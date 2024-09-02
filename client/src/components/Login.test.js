// Login.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';

describe('Login Component', () => {
  test('renders email input and send OTP button', () => {
    render(<Login onLogin={jest.fn()} />);
    
    // Check if email input is in the document
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    
    // Check if Send OTP button is present
    expect(screen.getByText(/send otp/i)).toBeInTheDocument();
  });

  test('displays OTP input after sending OTP', async () => {
    render(<Login onLogin={jest.fn()} />);
    
    // Mock the fetch request to return a successful response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    // Type into the email input
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    // Click the Send OTP button
    fireEvent.click(screen.getByText(/send otp/i));

    // Wait for OTP input to appear
    await waitFor(() => screen.getByLabelText(/otp/i));
    
    // Check if OTP input is now in the document
    expect(screen.getByLabelText(/otp/i)).toBeInTheDocument();
  });

  test('displays an error if OTP is incorrect', async () => {
    render(<Login onLogin={jest.fn()} />);
    
    // Mock the fetch request to return an error response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid OTP' }),
      })
    );

    // Simulate OTP already being sent
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByText(/send otp/i));
    await waitFor(() => screen.getByLabelText(/otp/i));
    
    // Type into the OTP input
    fireEvent.change(screen.getByLabelText(/otp/i), {
      target: { value: '123456' },
    });

    // Click the Verify OTP button
    fireEvent.click(screen.getByText(/verify otp/i));

    // Check for error message
    await waitFor(() => screen.getByText(/invalid otp/i));
    expect(screen.getByText(/invalid otp/i)).toBeInTheDocument();
  });
});
