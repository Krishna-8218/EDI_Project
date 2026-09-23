import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  statusCode: number;
  errors?: unknown;

  constructor(message: string, statusCode = 500, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  console.error('💥 Unhandled Exception:', err);

  if (err instanceof AppError) {
    ApiResponse.error(res, err.message, err.statusCode, err.errors);
    return;
  }

  // Handle Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || [];
      const field = target.length > 0 ? target.join(', ') : 'field';
      ApiResponse.error(res, `A record with this ${field} already exists.`, 409);
      return;
    }

    if (err.code === 'P2025') {
      ApiResponse.error(res, 'Requested record not found in database.', 404);
      return;
    }

    if (err.code === 'P2003') {
      ApiResponse.error(
        res,
        'Foreign key constraint violation. Associated record does not exist or cannot be deleted.',
        400
      );
      return;
    }
  }

  // Default internal server error (never leak raw traces)
  ApiResponse.error(res, 'Internal server error occurred. Please try again later.', 500);
};
