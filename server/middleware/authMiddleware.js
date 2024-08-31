import jwt from 'jsonwebtoken';
import { users } from '../users.mjs';

export const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    jwt.verify(token, 'your_jwt_secret', (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = users.find(u => u.email === user.email);
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
