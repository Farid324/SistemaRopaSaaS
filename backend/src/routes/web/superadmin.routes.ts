import { Router } from 'express';
import { superAdminController } from '../../controllers/web/superadmin.controller';
import { authMiddleware } from '../../shared/middlewares/authMiddleware';
import { requireRole } from '../../shared/middlewares/roleMiddleware';

const router = Router();

// Login (Público)
router.post('/login', superAdminController.login);

// Rutas protegidas (Solo SUPER_ADMIN)
router.use(authMiddleware);
router.use(requireRole('SUPER_ADMIN'));

router.get('/empresas', superAdminController.getEmpresas);
router.post('/empresas/:id/aprobar', superAdminController.aprobarEmpresa);
router.post('/empresas/:id/rechazar', superAdminController.rechazarEmpresa);
router.put('/empresas/:id/plan', superAdminController.cambiarPlanEmpresa);

router.get('/clientes', superAdminController.getClientes);
router.put('/clientes/:id/estado', superAdminController.cambiarEstadoUsuario);
router.delete('/clientes/:id', superAdminController.eliminarCliente);

export default router;
