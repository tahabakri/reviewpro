import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export interface AuthOptions {
  requireRole?: 'user' | 'admin';
}

export function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
}

export function requireRole(role: 'user' | 'admin') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (req.user.role !== role && req.user.role !== 'admin') {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid authentication token' });
    }
  };
}

function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  const [type, token] = authHeader.split(' ');
  
  if (type !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

function verifyToken(token: string): AuthenticatedUser {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthenticatedUser;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Test token generator for development
export function generateTestToken(user: Omit<AuthenticatedUser, 'role'> & { role?: 'user' | 'admin' }): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'user'
    },
    secret,
    { expiresIn: '24h' }
  );
}