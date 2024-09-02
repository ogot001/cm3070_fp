import jwt from 'jsonwebtoken'; // Import the jsonwebtoken library for JWT handling
import { users } from '../users.mjs'; // Import the users array from users.mjs

// Middleware function to authenticate JWT (JSON Web Token)
export const authenticateJWT = (req, res, next) => {
  // Extract the token from the Authorization header (e.g., "Bearer <token>")
  const token = req.headers.authorization?.split(' ')[1];
  
  // If a token is provided, proceed to verify it
  if (token) {
    // Verify the token using the secret key 'your_jwt_secret'
    jwt.verify(token, 'your_jwt_secret', (err, user) => {
      // If verification fails (e.g., token is invalid or expired), respond with a 403 Forbidden status
      if (err) {
        return res.sendStatus(403);
      }
      // If verification is successful, find the corresponding user by email in the users array
      req.user = users.find(u => u.email === user.email);
      // Call next() to proceed to the next middleware or route handler
      next();
    });
  } else {
    // If no token is provided, respond with a 401 Unauthorized status
    res.sendStatus(401);
  }
};
