import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ApiResponse } from '../utils/apiResponse';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.error(res, 'Authentication required before role check.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      ApiResponse.error(
        res,
        `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`,
        403
      );
      return;
    }

    next();
  };
};
