import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthenticatedUser } from '../types/index.js';

export interface TokenPayload {
  userId: string;
  email: string;
}

export function signUserToken(user: AuthenticatedUser): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
  };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyUserToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
