// backend/src/controllers/ventas.controller.ts

import { Request, Response } from 'express';
import { ventasService } from '../services/ventas.service';
import { asString } from '../shared/helpers';

export const ventasController = {
  async list(req: Request, res: Response) {
    try {
      const user = req.user!;
      const filters: any = {
        empresaId: asString(req.query.empresaId),
        sucursalId: asString(req.query.sucursalId),
        vendedorId: asString(req.query.vendedorId),
      };

      if (user.rol === 'EMPLEADO') filters.vendedorId = user.userId;

      const ventas = await ventasService.list(filters);
      res.json(ventas);
    } catch (error) {
      console.error('List ventas error:', error);
      res.status(500).json({ message: 'Error al obtener ventas' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { prendaIds, metodosPago, sucursalId: bodySucursalId } = req.body;
      const user = req.user!;

      if (!prendaIds || !Array.isArray(prendaIds) || prendaIds.length === 0) {
        return res.status(400).json({ message: 'Debe incluir al menos una prenda' });
      }

      const sucursalId = user.sucursalId || bodySucursalId;
      if (!sucursalId) return res.status(400).json({ message: 'Sucursal requerida' });

      const venta = await ventasService.crear({
        empresaId: user.empresaId,
        sucursalId,
        vendedorId: user.userId,
        prendaIds,
        metodosPago,
      });

      res.status(201).json(venta);
    } catch (error: any) {
      if (error.message?.includes('no están disponibles') || error.message?.includes('no coinciden')) {
        return res.status(400).json({ message: error.message });
      }
      console.error('Create venta error:', error);
      res.status(500).json({ message: 'Error al registrar venta' });
    }
  },
};