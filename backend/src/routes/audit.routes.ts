import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(requireAuth);
router.use(requireRole(Role.ADMIN));

router.get('/', AuditController.getAll);

export default router;
