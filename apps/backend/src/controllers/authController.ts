import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

import { getJwtSecret, JWT_ALGORITHM, JWT_EXPIRES_IN } from '../config/jwt.js';

export const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if ((user as any).isActive === false) {
      return res.status(401).json({ error: 'حساب کاربری شما غیرفعال شده است. لطفاً با مدیر سیستم یا منابع انسانی تماس بگیرید.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      {
        expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
        algorithm: JWT_ALGORITHM,
      },
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: (user as any).isActive ?? true,
        department: (user as any).department ?? null,
        position: (user as any).position ?? null,
      },
    });
  } catch (error) {
    console.error('[auth] Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = (_req: Request, res: Response) => {
  res.json({ message: 'Logout successful' });
};
