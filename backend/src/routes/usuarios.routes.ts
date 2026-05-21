// backend/src/routes/usuarios.routes.ts

import { Router } from 'express';
import { usuariosController } from '../controllers/usuarios.controller';
import { authMiddleware } from '../shared/middlewares/authMiddleware';
import { ownersAndAdmins } from '../shared/middlewares/roleMiddleware';

const router = Router();

router.use(authMiddleware, ownersAndAdmins);

router.get('/', usuariosController.list);
router.post('/', usuariosController.create);
router.put('/:id', usuariosController.update);
router.delete('/:id', usuariosController.remove);

export default router;