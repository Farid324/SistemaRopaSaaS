// backend/src/routes/auth.routes.ts

import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../shared/middlewares/authMiddleware';

const router = Router();

router.post('/login', authController.login);
router.post('/cambiar-password', authMiddleware, authController.cambiarPassword);
router.get('/me', authMiddleware, authController.me);

export default router;