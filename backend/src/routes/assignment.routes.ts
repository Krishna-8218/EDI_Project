import { Router } from 'express';
import { AssignmentController } from '../controllers/assignment.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createAssignmentSchema,
  getAssignmentsQuerySchema,
  returnAssignmentSchema,
} from '../validations/assignment.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(requireAuth);

router.get('/', validateRequest(getAssignmentsQuerySchema), AssignmentController.getAll);
router.get('/:id', AssignmentController.getById);

// Asset assignment & returns restricted to ADMIN and MANAGER
router.post(
  '/',
  requireRole(Role.ADMIN, Role.MANAGER),
  validateRequest(createAssignmentSchema),
  AssignmentController.create
);

router.put(
  '/:id/return',
  requireRole(Role.ADMIN, Role.MANAGER),
  validateRequest(returnAssignmentSchema),
  AssignmentController.returnAsset
);

export default router;
