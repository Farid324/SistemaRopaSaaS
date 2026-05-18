// backend/src/routes/dashboard.routes.ts  (REEMPLAZA el existente)

import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../shared/middlewares/authMiddleware';
import { anyRole, onlyOwners } from '../shared/middlewares/roleMiddleware';

const router = Router();

router.use(authMiddleware, anyRole);

// PUNTO 2: Stats con filtro por sucursal (query: ?sucursalId=xxx)
router.get('/stats', dashboardController.stats);

// PUNTO 6: Plan actual real (desde la empresa del usuario)
router.get('/plan-actual', dashboardController.planActual);

// PUNTO 5: Verificar límite antes de crear (query: ?tipo=sucursales|empleados|prendas)
router.get('/verificar-limite', dashboardController.verificarLimite);

// PUNTO 3: Datos para reporte PDF (query: ?desde=...&hasta=...&sucursalId=...)
router.get('/reporte-data', dashboardController.reporteData);

// PUNTO 4: Importar prendas masivo (body: { prendas: [...] })
router.post('/importar-prendas', dashboardController.importarPrendas);

// Planes disponibles
router.get('/planes', dashboardController.planes);

export default router;
