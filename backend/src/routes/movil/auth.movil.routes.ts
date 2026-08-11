// backend/src/routes/movil/auth.movil.routes.ts

import { Router } from 'express';
import { authMovilController } from '../../controllers/movil/auth.movil.controller';
import { authMiddleware } from '../../shared/middlewares/authMiddleware';

const router = Router();

// Pública (para staff)
router.post('/login', authMovilController.login);
router.post('/forgot-password', authMovilController.forgotPassword);
router.post('/verify-pin', authMovilController.verifyPin);
router.post('/reset-password', authMovilController.resetPassword);

// Protegidas
router.post('/cambiar-password-obligatorio', authMiddleware, authMovilController.cambiarPassword);
router.post('/cambiar-contrasena', authMiddleware, authMovilController.cambiarContrasena);
router.put('/foto-perfil', authMiddleware, authMovilController.actualizarFoto);
router.get('/me', authMiddleware, authMovilController.me);

export default router;
