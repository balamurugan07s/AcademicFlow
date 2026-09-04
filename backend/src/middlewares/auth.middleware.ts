import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { verifyUserToken } from '../lib/jwt.js';
import { AppError } from './error.middleware.js';

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.headers.cookie) {
      // Fallback check for session cookie
      const cookies = Object.fromEntries(
        req.headers.cookie.split(';').map((c) => {
          const [k, v] = c.trim().split('=');
          return [k, v];
        })
      );
      token = cookies['auth_token'];
    }

    if (!token) {
      throw new AppError('Authentication required. Missing Bearer token.', 401, 'UNAUTHORIZED');
    }

    try {
      const payload = verifyUserToken(token);
      req.user = {
        id: payload.userId,
        email: payload.email,
        name: null,
      };
      return next();
    } catch {
      throw new AppError('Invalid or expired authentication token.', 401, 'INVALID_TOKEN');
    }
  } catch (error) {
    return next(error);
  }
}
