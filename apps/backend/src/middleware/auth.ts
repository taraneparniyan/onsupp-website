import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

import { getJwtSecret, JWT_ALGORITHM } from '../config/jwt.js';

export const prisma = new PrismaClient();

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
  name?: string | null;
  isActive: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3003',
  'http://127.0.0.1:3003',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.header('Authorization') || req.header('authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader?.trim();
  let isCookieAuth = false;

  // Support cookie fallback (e.g. from SSR / proxy / browser cookie)
  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1].trim());
      isCookieAuth = true;
    }
  }

  if (!token) {
    return next();
  }

  // CSRF Defense-in-depth: For state-changing operations authenticated via cookie, verify Origin
  if (isCookieAuth && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : undefined);
    if (origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({ error: 'CSRF validation failed: unauthorized origin' });
    }
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret, {
      algorithms: [JWT_ALGORITHM],
    }) as jwt.JwtPayload & {
      id: number;
      email: string;
      role: string;
    };

    if (!decoded || typeof decoded.id !== 'number') {
      return res.status(401).json({ error: 'توکن نامعتبر است' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, name: true, isActive: true },
      });

      if (!user) {
        return res.status(401).json({ error: 'حساب کاربری یافت نشد یا حذف شده است' });
      }

      if (user.isActive === false) {
        return res.status(401).json({ error: 'حساب کاربری شما غیرفعال شده است' });
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isActive: user.isActive,
      };
      return next();
    } catch (dbError) {
      console.error('[auth] Database user verification failed during authentication:', dbError);
      return res.status(401).json({ error: 'خطا در اعتبارسنجی حساب کاربری' });
    }
  } catch {
    return res.status(401).json({ error: 'توکن منقضی یا نامعتبر است' });
  }
};

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (!req.user.isActive) {
    return res.status(401).json({ error: 'حساب کاربری شما غیرفعال شده است.' });
  }
  next();
};

/**
 * Generic RBAC guard requiring the authenticated user to hold at least one of the specified roles.
 * Note: SUPER_ADMIN is implicitly permitted across all managerial role checks.
 */
export const requireRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!req.user.isActive) {
      return res.status(401).json({ error: 'حساب کاربری شما غیرفعال شده است.' });
    }

    const userRole = req.user.role;
    // SUPER_ADMIN has full permissions across all management modules
    if (userRole === 'SUPER_ADMIN') {
      return next();
    }

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ error: 'Access denied: insufficient permissions' });
  };
};

export const requireSuperAdmin = requireRoles('SUPER_ADMIN');
export const requireAdmin = requireRoles('SUPER_ADMIN', 'ADMIN');
export const requireContentManager = requireRoles('SUPER_ADMIN', 'ADMIN', 'CONTENT_SEO_MANAGER');
export const requireSupport = requireRoles('SUPER_ADMIN', 'ADMIN', 'SUPPORT');
export const requireCommentModerator = requireRoles('SUPER_ADMIN', 'ADMIN', 'CONTENT_SEO_MANAGER', 'SUPPORT');
export const requireHR = requireRoles('SUPER_ADMIN', 'HR');
export const requireProjectManager = requireRoles('SUPER_ADMIN', 'PROJECT_MANAGER');
