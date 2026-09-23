import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../utils/apiResponse';

export class DashboardController {
  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getStats();
      ApiResponse.success(res, stats, 'Dashboard statistics retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}
