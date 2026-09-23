import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { loginSchema, registerSchema } from '../validations/auth.validation';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', requireAuth, AuthController.getMe);

export default router;
