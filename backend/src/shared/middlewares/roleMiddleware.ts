// backend/src/shared/middlewares/roleMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { Rol } from '@prisma/client';

/**
 * Verifica si el usuario tiene uno de los roles permitidos.
 * DEBE usarse DESPUÉS de authMiddleware.
 */
export function requireRole(...allowedRoles: Rol[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });

    if (!allowedRoles.includes(req.user.rol as Rol)) {
      return res.status(403).json({
        message: 'No tienes permisos para esta acción',
        required: allowedRoles,
        current: req.user.rol,
      });
    }

    next();
  };
}

// Shortcuts útiles
export const onlyOwners = requireRole('OWNER_PRINCIPAL', 'CO_OWNER', 'SUPER_ADMIN');
export const ownersAndAdmins = requireRole('OWNER_PRINCIPAL', 'CO_OWNER', 'SUPER_ADMIN', 'ADMINISTRADOR');
export const anyRole = requireRole('OWNER_PRINCIPAL', 'CO_OWNER', 'SUPER_ADMIN', 'ADMINISTRADOR', 'EMPLEADO');