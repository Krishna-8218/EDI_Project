import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from '../services/maintenance.service';
import { ApiResponse } from '../utils/apiResponse';

export class MaintenanceController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await MaintenanceService.createMaintenance(req.body, req.user?.id);
      ApiResponse.success(res, record, 'Maintenance scheduled successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { records, pagination } = await MaintenanceService.getMaintenanceList(req.query as any);
      ApiResponse.success(res, records, 'Maintenance records retrieved successfully', 200, pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await MaintenanceService.getMaintenanceById(req.params.id);
      ApiResponse.success(res, record, 'Maintenance record details retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await MaintenanceService.updateMaintenance(req.params.id, req.body, req.user?.id);
      ApiResponse.success(res, updated, 'Maintenance record updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MaintenanceService.deleteMaintenance(req.params.id, req.user?.id);
      ApiResponse.success(res, result, 'Maintenance record deleted successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}
