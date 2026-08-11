// backend/src/routes/index.ts

import { Router } from 'express';

// Rutas Web (B2C)
import authWebRoutes from './web/auth.web.routes';
import prendasWebRoutes from './web/prendas.web.routes';
import superAdminRoutes from './web/superadmin.routes';
import configRoutes from './web/config.routes';

// Rutas Móvil (B2B)
import authMovilRoutes from './movil/auth.movil.routes';
import dashboardMovilRoutes from './movil/dashboard.movil.routes';
import sucursalesMovilRoutes from './movil/sucursales.movil.routes';
import usuariosMovilRoutes from './movil/usuarios.movil.routes';
import ventasMovilRoutes from './movil/ventas.movil.routes';
import prendasMovilRoutes from './movil/prendas.movil.routes';

const router = Router();

// ════════════ RUTAS WEB (CLIENTES) ════════════
router.use('/web/auth', authWebRoutes);
router.use('/web/prendas', prendasWebRoutes);
router.use('/web/superadmin', superAdminRoutes);
router.use('/web/config', configRoutes);

// ════════════ RUTAS MÓVIL (OWNERS/EMPLEADOS) ════════════
router.use('/movil/auth', authMovilRoutes);
router.use('/movil/dashboard', dashboardMovilRoutes);
router.use('/movil/sucursales', sucursalesMovilRoutes);
router.use('/movil/usuarios', usuariosMovilRoutes);
router.use('/movil/ventas', ventasMovilRoutes);
router.use('/movil/prendas', prendasMovilRoutes);

export default router;