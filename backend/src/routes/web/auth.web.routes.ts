// backend/src/routes/web/auth.web.routes.ts

import { Router } from 'express';
import { authWebController } from '../../controllers/web/auth.web.controller';
import { authMiddleware } from '../../shared/middlewares/authMiddleware';

const router = Router();

// Públicas
router.post('/login-cliente', authWebController.loginCliente);
router.post('/registrar-cliente', authWebController.registrarCliente);
router.post('/verificar-email', authWebController.verificarEmail);
router.post('/reenviar-verificacion', authWebController.reenviarVerificacion);
router.post('/google', authWebController.googleAuth);
router.post('/upgrade-to-owner', authMiddleware, authWebController.upgradeToOwner);
router.post('/forgot-password', authWebController.forgotPassword);
router.post('/verify-pin', authWebController.verifyPin);
router.post('/reset-password', authWebController.resetPassword);

export default router;
