// backend/src/routes/auth.routes.ts  (REEMPLAZA el existente)
 
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../shared/middlewares/authMiddleware';
 
const router = Router();
 
router.post('/login', authController.login);
router.post('/cambiar-password', authMiddleware, authController.cambiarPassword);     // Primer ingreso
router.post('/cambiar-contrasena', authMiddleware, authController.cambiarContrasena); // Desde perfil
router.get('/me', authMiddleware, authController.me);
 
export default router;