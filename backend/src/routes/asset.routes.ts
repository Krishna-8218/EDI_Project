import { Router } from 'express';
import { AssetController } from '../controllers/asset.controller';
import { HealthController } from '../controllers/health.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  assetIdParamSchema,
  createAssetSchema,
  getAssetsQuerySchema,
  updateAssetSchema,
} from '../validations/asset.validation';
import { Role } from '@prisma/client';

const router = Router();

// All asset routes require authentication
router.use(requireAuth);

// AI Health & Risk Overview (Admin only - must precede /:id)
router.get(
  '/health/overview',
  requireRole(Role.ADMIN),
  HealthController.getOverview
);

router.get('/', validateRequest(getAssetsQuerySchema), AssetController.getAll);

// Specific Asset Health Prediction Endpoints (Admin only - registered before or alongside /:id)
router.get(
  '/:id/health',
  requireRole(Role.ADMIN),
  validateRequest(assetIdParamSchema),
  HealthController.getHealth
);

router.get(
  '/:id/health/history',
  requireRole(Role.ADMIN),
  validateRequest(assetIdParamSchema),
  HealthController.getHistory
);

router.post(
  '/:id/predict',
  requireRole(Role.ADMIN),
  validateRequest(assetIdParamSchema),
  HealthController.predict
);

router.get('/:id', validateRequest(assetIdParamSchema), AssetController.getById);


// Creation and deletion restricted to ADMIN; updates allowed for ADMIN and MANAGER
router.post(
  '/',
  requireRole(Role.ADMIN),
  validateRequest(createAssetSchema),
  AssetController.create
);

router.put(
  '/:id',
  requireRole(Role.ADMIN, Role.MANAGER),
  validateRequest(updateAssetSchema),
  AssetController.update
);

router.delete(
  '/:id',
  requireRole(Role.ADMIN),
  validateRequest(assetIdParamSchema),
  AssetController.delete
);

export default router;
