// backend/src/routes/dashboard.routes.ts

import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../shared/middlewares/authMiddleware';
import { anyRole } from '../shared/middlewares/roleMiddleware';

const router = Router();

router.use(authMiddleware, anyRole);

router.get('/stats', dashboardController.stats);
router.get('/planes', dashboardController.planes);

export default router;