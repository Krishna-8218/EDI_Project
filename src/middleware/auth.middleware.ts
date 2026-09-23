import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { ApiResponse } from '../utils/apiResponse';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string | null;
  status: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ApiResponse.error(res, 'Authentication token required. Please log in.', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      ApiResponse.error(res, 'Invalid token format.', 401);
      return;
    }

    let payload: JwtPayload;
    try {
      payload = verifyToken(token);
    } catch {
      ApiResponse.error(res, 'Invalid or expired authentication token.', 401);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        status: true,
      },
    });

    if (!user) {
      ApiResponse.error(res, 'User associated with token no longer exists.', 401);
      return;
    }

    if (user.status === 'INACTIVE') {
      ApiResponse.error(res, 'User account is deactivated.', 403);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
