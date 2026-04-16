// backend/src/services/auth.service.ts

import { prisma } from '../config/prisma';
import { generateToken, hashPassword, comparePassword } from '../config/auth';

export const authService = {
  async login(correo: string, password: string) {
    const user = await prisma.usuario.findUnique({ where: { correo } });
    if (!user) return { error: 'Credenciales incorrectas', status: 401 };
    if (user.estado !== 'ACTIVO') return { error: 'Cuenta bloqueada', status: 403 };

    if (!comparePassword(password, user.password)) {
      return { error: 'Credenciales incorrectas', status: 401 };
    }

    const token = generateToken({
      userId: user.id,
      empresaId: user.empresaId,
      rol: user.rol,
      sucursalId: user.sucursalId || undefined,
    });

    const { password: _, ...userData } = user;
    return { token, user: userData };
  },

  async cambiarPassword(userId: string, nuevaPassword: string) {
    const updated = await prisma.usuario.update({
      where: { id: userId },
      data: { password: hashPassword(nuevaPassword), debeCambiarPass: false },
    });

    const token = generateToken({
      userId: updated.id,
      empresaId: updated.empresaId,
      rol: updated.rol,
      sucursalId: updated.sucursalId || undefined,
    });

    const { password: _, ...userData } = updated;
    return { token, user: userData };
  },

  async getPerfil(userId: string) {
    return prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true, nombreCompleto: true, ci: true, correo: true,
        telefono: true, edad: true, fechaIngreso: true, fotoPerfil: true,
        rol: true, estado: true, debeCambiarPass: true, permisoEditarPrendas: true,
        empresaId: true, sucursalId: true,
        sucursal: { select: { nombre: true } },
        empresa: { select: { nombre: true, planId: true } },
      },
    });
  },
};