// backend/src/controllers/dashboard.controller.ts

import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { isOwnerRole } from '../shared/helpers';

export const dashboardController = {
  async stats(req: Request, res: Response) {
    try {
      const user = req.user!;
      const sucursalId = !isOwnerRole(user.rol) ? user.sucursalId : undefined;

      const stats = await dashboardService.getStats(user.empresaId, sucursalId);
      res.json(stats);
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
  },

  async planes(_req: Request, res: Response) {
    try {
      const planes = await dashboardService.getPlanes();
      res.json(planes);
    } catch (error) {
      console.error('Planes error:', error);
      res.status(500).json({ message: 'Error al obtener planes' });
    }
  },
};