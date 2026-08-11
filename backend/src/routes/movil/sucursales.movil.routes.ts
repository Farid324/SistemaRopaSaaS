// backend/src/routes/sucursales.routes.ts

import { Router } from 'express';
import { sucursalesController } from '../../controllers/movil/sucursales.movil.controller';
import { authMiddleware } from '../../shared/middlewares/authMiddleware';
import { onlyOwners, anyRole } from '../../shared/middlewares/roleMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', anyRole, sucursalesController.list);
router.get('/:id/delete-info', onlyOwners, sucursalesController.deleteInfo);
router.get('/:id/export-data', onlyOwners, sucursalesController.exportData);
router.post('/', onlyOwners, sucursalesController.create);
router.put('/:id', onlyOwners, sucursalesController.update);
router.delete('/:id', onlyOwners, sucursalesController.remove);

export default router;