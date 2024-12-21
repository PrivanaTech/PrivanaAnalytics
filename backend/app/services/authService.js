import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET;

// Function to sign a JWT
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

// Function to verify a JWT
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
