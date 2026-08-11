// backend/src/routes/prendas.routes.ts

import { Router } from 'express';
import { prendasController } from '../../controllers/movil/prendas.movil.controller';
import { authMiddleware } from '../../shared/middlewares/authMiddleware';
import { anyRole, ownersAndAdmins } from '../../shared/middlewares/roleMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', anyRole, prendasController.list);
router.get('/codigo/:codigo', anyRole, prendasController.findByCodigo);
router.post('/', anyRole, prendasController.create);
router.put('/:id', anyRole, prendasController.update);
router.delete('/:id', ownersAndAdmins, prendasController.remove);

export default router;