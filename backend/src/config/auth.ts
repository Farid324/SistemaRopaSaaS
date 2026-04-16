// backend/src/config/auth.ts

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'boutique-app-secret-key-2025';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  empresaId: string;
  rol: string;
  sucursalId?: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

// ── Hash de contraseñas (sin bcrypt, usando crypto nativo) ──
const SALT = 'boutique-salt-2025';

export function hashPassword(plain: string): string {
  return crypto.createHmac('sha256', SALT).update(plain).digest('hex');
}

export function comparePassword(plain: string, hashed: string): boolean {
  return hashPassword(plain) === hashed;
}