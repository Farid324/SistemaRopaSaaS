// backend/src/controllers/sucursales.controller.ts

import { Request, Response } from 'express';
import { sucursalesService } from '../services/sucursales.service';
import { asString } from '../shared/helpers';

export const sucursalesController = {
  async list(req: Request, res: Response) {
    try {
      const empresaId = asString(req.query.empresaId);
      const sucursales = await sucursalesService.list(empresaId);
      res.json(sucursales);
    } catch (error) {
      console.error('List sucursales error:', error);
      res.status(500).json({ message: 'Error al obtener sucursales' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const sucursal = await sucursalesService.create(req.body, req.user!.empresaId);
      res.status(201).json(sucursal);
    } catch (error) {
      console.error('Create sucursal error:', error);
      res.status(500).json({ message: 'Error al crear sucursal' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      if (!id) return res.status(400).json({ message: 'ID requerido' });

      const sucursal = await sucursalesService.update(id, req.body);
      res.json(sucursal);
    } catch (error) {
      console.error('Update sucursal error:', error);
      res.status(500).json({ message: 'Error al actualizar sucursal' });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      if (!id) return res.status(400).json({ message: 'ID requerido' });

      await sucursalesService.remove(id);
      res.json({ message: 'Sucursal eliminada' });
    } catch (error) {
      console.error('Delete sucursal error:', error);
      res.status(500).json({ message: 'Error al eliminar sucursal' });
    }
  },
};