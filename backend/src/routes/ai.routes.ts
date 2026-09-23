import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Protect AI chat endpoint so only authenticated users can query organizational data
router.use(requireAuth);

router.post('/chat', AIController.chat);

export default router;
