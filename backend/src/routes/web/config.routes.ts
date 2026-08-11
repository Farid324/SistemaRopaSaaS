import { Router } from 'express';
import { configController } from '../../controllers/web/config.controller';
import { authMiddleware } from '../../shared/middlewares/authMiddleware';
import { requireRole } from '../../shared/middlewares/roleMiddleware';

const router = Router();

// Público (lo usan los clientes al registrarse)
router.get('/qr', configController.getQrPago);

// Protegido (solo super admin)
router.use(authMiddleware);
router.use(requireRole('SUPER_ADMIN'));

router.put('/qr', configController.updateQrPago);

export default router;
