import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';
import { ApiResponse } from '../utils/apiResponse';

export class AuditController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const entity = req.query.entity as string | undefined;
      const action = req.query.action as string | undefined;

      const { logs, pagination } = await AuditService.getLogs({ page, limit, entity, action });
      ApiResponse.success(res, logs, 'Audit logs retrieved successfully', 200, pagination);
    } catch (error) {
      next(error);
    }
  }
}
