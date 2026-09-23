import { Request, Response, NextFunction } from 'express';
import { AssetService } from '../services/asset.service';
import { ApiResponse } from '../utils/apiResponse';

export class AssetController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await AssetService.createAsset(req.body, req.user?.id);
      ApiResponse.success(res, asset, 'Asset created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { assets, pagination } = await AssetService.getAssets(req.query as any);
      ApiResponse.success(res, assets, 'Assets retrieved successfully', 200, pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await AssetService.getAssetById(req.params.id);
      ApiResponse.success(res, asset, 'Asset details retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await AssetService.updateAsset(req.params.id, req.body, req.user?.id);
      ApiResponse.success(res, updated, 'Asset updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AssetService.deleteAsset(req.params.id, req.user?.id);
      ApiResponse.success(res, result, 'Asset deleted successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}
