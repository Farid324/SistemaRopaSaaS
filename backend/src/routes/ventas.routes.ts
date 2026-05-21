// backend/src/routes/ventas.routes.ts

import { Router } from 'express';
import { ventasController } from '../controllers/ventas.controller';
import { authMiddleware } from '../shared/middlewares/authMiddleware';
import { anyRole } from '../shared/middlewares/roleMiddleware';

const router = Router();

router.use(authMiddleware, anyRole);

router.get('/', ventasController.list);
router.post('/', ventasController.create);

export default router;