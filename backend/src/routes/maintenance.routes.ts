import { Router } from 'express';
import { MaintenanceController } from '../controllers/maintenance.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createMaintenanceSchema,
  getMaintenanceQuerySchema,
  updateMaintenanceSchema,
} from '../validations/maintenance.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(requireAuth);

router.get('/', validateRequest(getMaintenanceQuerySchema), MaintenanceController.getAll);
router.get('/:id', MaintenanceController.getById);

router.post(
  '/',
  requireRole(Role.ADMIN),
  validateRequest(createMaintenanceSchema),
  MaintenanceController.create
);

router.put(
  '/:id',
  requireRole(Role.ADMIN, Role.MANAGER),
  validateRequest(updateMaintenanceSchema),
  MaintenanceController.update
);

router.delete(
  '/:id',
  requireRole(Role.ADMIN),
  MaintenanceController.delete
);

export default router;
