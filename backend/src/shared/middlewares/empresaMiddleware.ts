// backend/src/shared/middlewares/empresaMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { isOwnerRole } from '../helpers';

/**
 * Fuerza que el usuario solo vea datos de SU empresa.
 * Inyecta req.query.empresaId automáticamente.
 */
export function filterByEmpresa(req: Request, _res: Response, next: NextFunction) {
  if (req.user) req.query.empresaId = req.user.empresaId;
  next();
}

/**
 * Filtra por empresa y, si NO es owner, también por su sucursal.
 */
export function filterBySucursal(req: Request, _res: Response, next: NextFunction) {
  if (req.user) {
    req.query.empresaId = req.user.empresaId;
    if (!isOwnerRole(req.user.rol) && req.user.sucursalId) {
      req.query.sucursalId = req.user.sucursalId;
    }
  }
  next();
}