import { render, screen, fireEvent } from '@testing-library/react';
import Record from './Record';
import { MemoryRouter } from 'react-router-dom';

// Mock data
const collectionName = "employees";

// Test case for required fields
test('shows required error message when submitting empty form', async () => {
  render(
    <MemoryRouter>
      <Record collectionName={collectionName} />
    </MemoryRouter>
  );

  fireEvent.submit(screen.getByText(/Save/i));

  // Check if the required error message is displayed
  expect(await screen.findByText(/This field is required/i)).toBeInTheDocument();
});

// Test case for invalid email
test('validates email field', async () => {
  render(
    <MemoryRouter>
      <Record collectionName={collectionName} />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/Email/i), {
    target: { value: 'invalid-email' },
  });
  fireEvent.submit(screen.getByText(/Save/i));

  // Check if the invalid email message is displayed
  expect(await screen.findByText(/Invalid email address/i)).toBeInTheDocument();
});

// Test case for phone number validation
test('validates phone number', async () => {
  render(
    <MemoryRouter>
      <Record collectionName={collectionName} />
    </MemoryRouter>
  );

  // Assuming you have labeled the phone number field properly
  const phoneInput = screen.getByPlaceholderText(/Phone/i);
  fireEvent.change(phoneInput, { target: { value: '123' } });
  fireEvent.submit(screen.getByText(/Save/i));

  // Ensure your formik validation shows appropriate error for invalid phone number
  expect(await screen.findByText(/Invalid phone number/i)).toBeInTheDocument();
});
