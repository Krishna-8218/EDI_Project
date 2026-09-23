import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ApiResponse } from '../utils/apiResponse';

export class UserController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createUser(req.body, req.user?.id);
      ApiResponse.success(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { users, pagination } = await UserService.getUsers(req.query as any);
      ApiResponse.success(res, users, 'Users retrieved successfully', 200, pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getUserById(req.params.id);
      ApiResponse.success(res, user, 'User details retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await UserService.updateUser(req.params.id, req.body, req.user?.id);
      ApiResponse.success(res, updated, 'User updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.deleteUser(req.params.id, req.user?.id);
      ApiResponse.success(res, result, 'User deleted successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}
