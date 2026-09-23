import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    pagination?: PaginationMeta
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(pagination && { pagination }),
    });
  }

  static error(
    res: Response,
    message = 'Internal Server Error',
    statusCode = 500,
    errors?: unknown
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors ? { errors } : {}),
    });
  }
}
