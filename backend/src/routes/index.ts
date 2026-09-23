import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import assetRoutes from './asset.routes';
import assignmentRoutes from './assignment.routes';
import maintenanceRoutes from './maintenance.routes';
import reportRoutes from './report.routes';
import userRoutes from './user.routes';
import auditRoutes from './audit.routes';
import dashboardRoutes from './dashboard.routes';
import aiRoutes from './ai.routes';
import { ApiResponse } from '../utils/apiResponse';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  ApiResponse.success(
    res,
    {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'AssetFlow API',
      version: '1.0.0',
    },
    'AssetFlow API is running'
  );
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/assets', assetRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ai', aiRoutes);

export default router;
