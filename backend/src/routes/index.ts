// backend/src/routes/index.ts

import { Router } from 'express';
import authRoutes from './auth.routes';
import usuariosRoutes from './usuarios.routes';
import sucursalesRoutes from './sucursales.routes';
import prendasRoutes from './prendas.routes';
import ventasRoutes from './ventas.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/sucursales', sucursalesRoutes);
router.use('/prendas', prendasRoutes);
router.use('/ventas', ventasRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;