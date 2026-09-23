import { Request, Response, NextFunction } from 'express';
import { HealthPredictionService } from '../services/healthPrediction.service';
import { ApiResponse } from '../utils/apiResponse';

export class HealthController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await HealthPredictionService.getHealthOverview();
      ApiResponse.success(res, overview, 'Asset health overview retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const health = await HealthPredictionService.getAssetHealth(req.params.id);
      ApiResponse.success(res, health, 'Asset health prediction retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await HealthPredictionService.getAssetHealthHistory(req.params.id);
      ApiResponse.success(res, history, 'Asset health history retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  static async predict(req: Request, res: Response, next: NextFunction) {
    try {
      const prediction = await HealthPredictionService.predictAssetHealth(req.params.id, req.user?.id);
      ApiResponse.success(res, prediction, 'AI Health prediction completed successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}
