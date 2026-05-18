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

  /**
   * Devuelve conteos de datos asociados a una sucursal (para el modal de confirmación).
   */
  async deleteInfo(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      if (!id) return res.status(400).json({ message: 'ID requerido' });

      const info = await sucursalesService.getDeleteInfo(id);
      res.json(info);
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') return res.status(404).json({ message: error.message });
      console.error('Delete info error:', error);
      res.status(500).json({ message: 'Error al obtener información' });
    }
  },

  /**
   * Devuelve prendas y ventas de una sucursal para exportar antes de eliminar.
   */
  async exportData(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      if (!id) return res.status(400).json({ message: 'ID requerido' });

      const data = await sucursalesService.getExportData(id);
      res.json(data);
    } catch (error) {
      console.error('Export data error:', error);
      res.status(500).json({ message: 'Error al exportar datos' });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      if (!id) return res.status(400).json({ message: 'ID requerido' });

      await sucursalesService.remove(id);
      res.json({ message: 'Sucursal eliminada correctamente' });
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') return res.status(404).json({ message: error.message });
      console.error('Delete sucursal error:', error);
      res.status(500).json({ message: 'Error al eliminar sucursal' });
    }
  },
};