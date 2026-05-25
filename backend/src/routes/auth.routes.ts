// backend/src/routes/auth.routes.ts  (REEMPLAZA el existente)
 
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../shared/middlewares/authMiddleware';
 
const router = Router();
 
router.post('/login', authController.login);
router.post('/cambiar-password', authMiddleware, authController.cambiarPassword);     // Primer ingreso
router.post('/cambiar-contrasena', authMiddleware, authController.cambiarContrasena); // Desde perfil
router.post('/actualizar-foto', authMiddleware, authController.actualizarFoto);       // PUNTO 1: Foto persistente
router.get('/me', authMiddleware, authController.me);

// Rutas de Recuperación de Contraseña (Públicas)
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-pin', authController.verifyPin);
router.post('/reset-password', authController.resetPassword);
 
export default router;