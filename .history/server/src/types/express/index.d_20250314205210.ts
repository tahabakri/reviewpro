import { Express } from 'express-serve-static-core';
import { AuthenticatedUser } from '../../middleware/auth';

declare global {
  namespace Express {
    interface Request {
      user: AuthenticatedUser;
    }
  }
}
