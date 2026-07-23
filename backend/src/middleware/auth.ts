import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token required.' });
  }

  const secret = process.env.JWT_SECRET || 'koncepthive_super_secret_jwt_key_2026';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
    req.user = decoded as { id: string; email: string; name: string };
    next();
  });
};
