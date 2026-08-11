// backend/src/controllers/prendas.controller.ts

import { Request, Response } from 'express';
import { prendasService } from '../../services/prendas.service';
import { asString, isOwnerRole } from '../../shared/helpers';

export const prendasController = {
  async list(req: Request, res: Response) {
    try {
      const user = req.user!;
      // SIEMPRE filtrar por la empresa del usuario autenticado (del JWT)
      const filters: any = {
        empresaId: user.empresaId!,
        estadoVenta: asString(req.query.estadoVenta),
        search: asString(req.query.search),
      };

      // Si NO es owner, filtrar por su sucursal
      if (!isOwnerRole(user.rol) && user.sucursalId) {
        filters.sucursalId = user.sucursalId;
      }

      const prendas = await prendasService.list(filters);
      res.json(prendas);
    } catch (error) {
      console.error('List prendas error:', error);
      res.status(500).json({ message: 'Error al obtener prendas' });
    }
  },

  async findByCodigo(req: Request, res: Response) {
    try {
      const codigo = asString(req.params.codigo);
      if (!codigo) return res.status(400).json({ message: 'Código requerido' });

      const prenda = await prendasService.findByCodigo(codigo, req.user!.empresaId!);
      if (!prenda) return res.status(404).json({ message: 'Prenda no encontrada' });

      res.json(prenda);
    } catch (error) {
      console.error('Find prenda error:', error);
      res.status(500).json({ message: 'Error al buscar prenda' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const user = req.user!;
      const sucursalId = isOwnerRole(user.rol) ? req.body.sucursalId : user.sucursalId;

      const prenda = await prendasService.create(req.body, user.empresaId!, sucursalId);
      res.status(201).json(prenda);
    } catch (error: any) {
      if (error.code === 'P2002') return res.status(409).json({ message: 'Código ya registrado' });
      console.error('Create prenda error:', error);
      res.status(500).json({ message: 'Error al crear prenda' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      if (!id) return res.status(400).json({ message: 'ID requerido' });

      // Verificar que la prenda pertenece a la empresa del usuario
      const existing = await prendasService.findById(id);
      if (!existing || existing.empresaId !== req.user!.empresaId!) {
        return res.status(404).json({ message: 'Prenda no encontrada' });
      }

      const prenda = await prendasService.update(id, req.body);
      res.json(prenda);
    } catch (error) {
      console.error('Update prenda error:', error);
      res.status(500).json({ message: 'Error al actualizar prenda' });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      if (!id) return res.status(400).json({ message: 'ID requerido' });

      // Verificar que la prenda pertenece a la empresa del usuario
      const existing = await prendasService.findById(id);
      if (!existing || existing.empresaId !== req.user!.empresaId!) {
        return res.status(404).json({ message: 'Prenda no encontrada' });
      }

      await prendasService.remove(id);
      res.json({ message: 'Prenda eliminada' });
    } catch (error) {
      console.error('Delete prenda error:', error);
      res.status(500).json({ message: 'Error al eliminar prenda' });
    }
  },
};