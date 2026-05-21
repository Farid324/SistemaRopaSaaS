// backend/src/controllers/usuarios.controller.ts

import { Request, Response } from 'express';
import { usuariosService } from '../services/usuarios.service';
import { asString, isOwnerRole } from '../shared/helpers';

export const usuariosController = {
  async list(req: Request, res: Response) {
    try {
      const user = req.user!;
      // SIEMPRE filtrar por la empresa del usuario autenticado (del JWT)
      const empresaId = user.empresaId;

      // Si NO es owner, filtrar también por su sucursal
      const sucursalId = isOwnerRole(user.rol) ? undefined : user.sucursalId;

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
      const rolNuevo = req.body.rol;

      // ── Validación de jerarquía de roles para CREAR ──
      // Nadie puede crear SUPER_ADMIN desde la app
      if (rolNuevo === 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'No se puede crear un Super Admin' });
      }

      // OWNER_PRINCIPAL: puede crear CO_OWNER, ADMIN, EMPLEADO (NO otro OWNER_PRINCIPAL)
      if (user.rol === 'OWNER_PRINCIPAL' && rolNuevo === 'OWNER_PRINCIPAL') {
        return res.status(403).json({ message: 'No se puede crear otro Owner Principal' });
      }

      // CO_OWNER: solo puede crear ADMINISTRADOR y EMPLEADO (NO OWNER_PRINCIPAL ni CO_OWNER)
      if (user.rol === 'CO_OWNER' && (rolNuevo === 'OWNER_PRINCIPAL' || rolNuevo === 'CO_OWNER')) {
        return res.status(403).json({ message: 'Co-Owner solo puede crear administradores y empleados' });
      }

      // ADMINISTRADOR: solo puede crear EMPLEADO
      if (user.rol === 'ADMINISTRADOR' && rolNuevo !== 'EMPLEADO') {
        return res.status(403).json({ message: 'Admin solo puede crear empleados' });
      }

      const defaultSucursalId = isOwnerRole(user.rol) ? undefined : user.sucursalId;
      const usuario = await usuariosService.create(req.body, user.empresaId, defaultSucursalId, user.userId);
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

      // Verificar que el usuario objetivo pertenece a la misma empresa
      const target = await usuariosService.findById(id);
      if (!target || target.empresaId !== req.user!.empresaId) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

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
      if (!target || target.empresaId !== req.user!.empresaId) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const myRol = req.user!.rol;
      const targetRol = target.rol;

      // ── Validación de jerarquía de roles para ELIMINAR ──
      // OWNER_PRINCIPAL solo puede ser eliminado por SUPER_ADMIN
      if (targetRol === 'OWNER_PRINCIPAL' && myRol !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'No se puede eliminar al Owner Principal' });
      }

      // CO_OWNER: no puede eliminar OWNER_PRINCIPAL (ya cubierto arriba) ni otros CO_OWNER
      if (myRol === 'CO_OWNER' && (targetRol === 'OWNER_PRINCIPAL' || targetRol === 'CO_OWNER')) {
        return res.status(403).json({ message: 'Co-Owner no puede eliminar owners ni otros co-owners' });
      }

      // ADMINISTRADOR: solo puede eliminar EMPLEADO
      if (myRol === 'ADMINISTRADOR' && targetRol !== 'EMPLEADO') {
        return res.status(403).json({ message: 'Admin solo puede eliminar empleados' });
      }

      await usuariosService.remove(id);
      res.json({ message: 'Usuario eliminado' });
    } catch (error) {
      console.error('Delete usuario error:', error);
      res.status(500).json({ message: 'Error al eliminar usuario' });
    }
  },
};