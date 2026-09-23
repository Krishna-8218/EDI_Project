import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createReportSchema,
  getReportsQuerySchema,
  updateReportSchema,
} from '../validations/report.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(requireAuth);

// Any authenticated user can file an incident report
router.post('/', validateRequest(createReportSchema), ReportController.create);

router.get('/', validateRequest(getReportsQuerySchema), ReportController.getAll);
router.get('/:id', ReportController.getById);

// Updating/resolving reports restricted to ADMIN and MANAGER
router.put(
  '/:id',
  requireRole(Role.ADMIN, Role.MANAGER),
  validateRequest(updateReportSchema),
  ReportController.update
);

export default router;
