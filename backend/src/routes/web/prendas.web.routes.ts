// backend/src/routes/web/prendas.web.routes.ts

import { Router } from 'express';
import { prendasWebController } from '../../controllers/web/prendas.web.controller';

const router = Router();

// Pública - Cualquiera puede ver el catálogo web
router.get('/', prendasWebController.listPublic);

export default router;
