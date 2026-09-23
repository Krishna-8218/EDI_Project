import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { ApiResponse } from '../utils/apiResponse';

export class ReportController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReportService.createReport(req.body, req.user!.id);
      ApiResponse.success(res, report, 'Incident report submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { reports, pagination } = await ReportService.getReports(req.query as any);
      ApiResponse.success(res, reports, 'Reports retrieved successfully', 200, pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReportService.getReportById(req.params.id);
      ApiResponse.success(res, report, 'Report details retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await ReportService.updateReport(req.params.id, req.body, req.user?.id);
      ApiResponse.success(res, updated, 'Report updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}
