import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createUserSchema,
  getUsersQuerySchema,
  updateUserSchema,
} from '../validations/user.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(requireAuth);

// User listing restricted to ADMIN and MANAGER
router.get(
  '/',
  requireRole(Role.ADMIN, Role.MANAGER),
  validateRequest(getUsersQuerySchema),
  UserController.getAll
);

router.get('/:id', UserController.getById);

// Creation, update, and deletion restricted to ADMIN
router.post(
  '/',
  requireRole(Role.ADMIN),
  validateRequest(createUserSchema),
  UserController.create
);

router.put(
  '/:id',
  requireRole(Role.ADMIN),
  validateRequest(updateUserSchema),
  UserController.update
);

router.delete(
  '/:id',
  requireRole(Role.ADMIN),
  UserController.delete
);

export default router;
