import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await db.findUserByEmail(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const secret = process.env.JWT_SECRET || 'koncepthive_super_secret_jwt_key_2026';
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      secret,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
