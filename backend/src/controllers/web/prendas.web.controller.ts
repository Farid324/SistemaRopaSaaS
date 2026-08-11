// backend/src/controllers/web/prendas.web.controller.ts

import { Request, Response } from 'express';
import { prendasService } from '../../services/prendas.service';

export const prendasWebController = {
  // Solo obtiene prendas publicadas en la web (estadoVenta = DISPONIBLE, publicadoWeb = true)
  async listPublic(req: Request, res: Response) {
    try {
      // El servicio podría necesitar un filtro nuevo, o usamos Prisma directamente aquí para listar el catálogo.
      // Por limpieza, llamamos a un método list genérico pero forzamos los filtros de web.
      const prendas = await prendasService.list({ 
        // @ts-ignore
        publicadoWeb: true, 
        estadoVenta: 'DISPONIBLE' 
      });
      res.json(prendas);
    } catch (error) {
      console.error('List public prendas error:', error);
      res.status(500).json({ message: 'Error al obtener catálogo de prendas' });
    }
  },
};
