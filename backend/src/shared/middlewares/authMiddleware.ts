// backend/src/shared/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../../config/auth';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Verifica el token JWT en el header Authorization.
 * Si es válido, agrega `req.user` con los datos del usuario.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}