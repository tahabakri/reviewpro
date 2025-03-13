import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    businessId?: string;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user's business association and role
    const { data: businessUser, error: businessError } = await supabase
      .from('business_users')
      .select('business_id, role')
      .eq('user_id', user.id)
      .single();

    if (businessError) {
      return res.status(403).json({ error: 'User has no business association' });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      role: businessUser.role,
      businessId: businessUser.business_id,
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

export function validateBusinessAccess(paramName = 'businessId') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const requestedBusinessId = req.params[paramName] || req.body[paramName];
    
    // Super admins can access all businesses
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Regular users can only access their assigned business
    if (requestedBusinessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Access denied to this business' });
    }

    next();
  };
}