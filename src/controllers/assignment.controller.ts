import { Request, Response, NextFunction } from 'express';
import { AssignmentService } from '../services/assignment.service';
import { ApiResponse } from '../utils/apiResponse';

export class AssignmentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const assignment = await AssignmentService.assignAsset(req.body, req.user?.id);
      ApiResponse.success(res, assignment, 'Asset assigned successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async returnAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const returned = await AssignmentService.returnAsset(req.params.id, req.body, req.user?.id);
      ApiResponse.success(res, returned, 'Asset returned successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { assignments, pagination } = await AssignmentService.getAssignments(req.query as any);
      ApiResponse.success(res, assignments, 'Assignments retrieved successfully', 200, pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const assignment = await AssignmentService.getAssignmentById(req.params.id);
      ApiResponse.success(res, assignment, 'Assignment details retrieved', 200);
    } catch (error) {
      next(error);
    }
  }
}
