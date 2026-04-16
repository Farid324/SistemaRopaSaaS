// backend/src/controllers/usuarios.controller.ts

import { Request, Response } from 'express';
import { usuariosService } from '../services/usuarios.service';
import { asString, isOwnerRole } from '../shared/helpers';

export const usuariosController = {
  async list(req: Request, res: Response) {
    try {
      const empresaId = asString(req.query.empresaId);
      const sucursalId = asString(req.query.sucursalId);
      const usuarios = await usuariosService.list(empresaId, sucursalId);
      res.json(usuarios);
    } catch (error) {
      console.error('List usuarios error:', error);
      res.status(500).json({ message: 'Error al obtener usuarios' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const user = req.user!;
      if (user.rol === 'ADMINISTRADOR' && req.body.rol !== 'EMPLEADO') {
        return res.status(403).json({ message: 'Admin solo puede crear empleados' });
      }

      const defaultSucursalId = isOwnerRole(user.rol) ? undefined : user.sucursalId;
      const usuario = await usuariosService.create(req.body, user.empresaId, defaultSucursalId);
      res.status(201).json(usuario);
    } catch (error: any) {
      if (error.code === 'P2002') return res.status(409).json({ message: 'CI o correo ya registrado' });
      console.error('Create usuario error:', error);
      res.status(500).json({ message: 'Error al crear usuario' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      if (!id) return res.status(400).json({ message: 'ID requerido' });

      const updated = await usuariosService.update(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error('Update usuario error:', error);
      res.status(500).json({ message: 'Error al actualizar usuario' });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      if (!id) return res.status(400).json({ message: 'ID requerido' });
      if (id === req.user!.userId) return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });

      const target = await usuariosService.findById(id);
      if (!target || target.empresaId !== req.user!.empresaId) return res.status(404).json({ message: 'Usuario no encontrado' });
      if (target.rol === 'OWNER_PRINCIPAL' && req.user!.rol !== 'SUPER_ADMIN') return res.status(403).json({ message: 'No se puede eliminar al owner principal' });

      await usuariosService.remove(id);
      res.json({ message: 'Usuario eliminado' });
    } catch (error) {
      console.error('Delete usuario error:', error);
      res.status(500).json({ message: 'Error al eliminar usuario' });
    }
  },
};