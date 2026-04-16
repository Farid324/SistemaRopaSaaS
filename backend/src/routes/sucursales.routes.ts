// backend/src/routes/sucursales.routes.ts

import { Router } from 'express';
import { sucursalesController } from '../controllers/sucursales.controller';
import { authMiddleware } from '../shared/middlewares/authMiddleware';
import { onlyOwners, anyRole } from '../shared/middlewares/roleMiddleware';
import { filterByEmpresa } from '../shared/middlewares/empresaMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', anyRole, filterByEmpresa, sucursalesController.list);
router.post('/', onlyOwners, sucursalesController.create);
router.put('/:id', onlyOwners, sucursalesController.update);
router.delete('/:id', onlyOwners, sucursalesController.remove);

export default router;