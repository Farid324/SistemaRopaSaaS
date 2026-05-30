// backend/src/services/auth.service.ts  (REEMPLAZA el existente)

import { prisma } from '../config/prisma';
import { generateToken, hashPassword, comparePassword } from '../config/auth';
import { sendPinEmail } from './email.service';

export const authService = {
  async login(correo: string, password: string) {
    // correo ya no es único global — buscar el usuario ACTIVO con ese correo
    const user = await prisma.usuario.findFirst({ 
      where: { correo, estado: 'ACTIVO' },
      include: {
        sucursal: { select: { nombre: true } },
        empresa: { select: { nombre: true, planId: true } },
      }
    });
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

  // Primer ingreso (no requiere contraseña actual)
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

  // Desde perfil (requiere verificar contraseña actual)
  async cambiarContrasenaConVerificacion(userId: string, contrasenaActual: string, nuevaContrasena: string) {
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) return { error: 'Usuario no encontrado', status: 404 };

    if (!comparePassword(contrasenaActual, user.password)) {
      return { error: 'La contraseña actual es incorrecta', status: 400 };
    }

    await prisma.usuario.update({
      where: { id: userId },
      data: { password: hashPassword(nuevaContrasena) },
    });

    return { success: true };
  },

  // ═══════════════════ PUNTO 1: Foto de perfil persistente ═══════════════════
  async actualizarFotoPerfil(userId: string, fotoPerfil: string | null) {
    const updated = await prisma.usuario.update({
      where: { id: userId },
      data: { fotoPerfil },
      select: {
        id: true, nombreCompleto: true, fotoPerfil: true,
      },
    });
    return { message: 'Foto actualizada', fotoPerfil: updated.fotoPerfil };
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

  // ════════════ RECUPERACIÓN DE CONTRASEÑA ════════════
  async generarPinRecuperacion(correo: string) {
    const user = await prisma.usuario.findFirst({ where: { correo, estado: 'ACTIVO' } });
    if (!user) return { error: 'No existe una cuenta activa con este correo', status: 404 };
    if (user.estado !== 'ACTIVO') return { error: 'La cuenta no está activa o fue eliminada', status: 403 };

    // Generar PIN de 6 dígitos
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // Expira en 15 mins

    await prisma.usuario.update({
      where: { id: user.id },
      data: { resetPin: pin, resetPinExpires: expires },
    });

    // Enviar correo de recuperación
    await sendPinEmail(correo, pin).catch(e => console.error('Error al enviar PIN:', e));
    return { success: true };
  },

  async verificarPinRecuperacion(correo: string, pin: string) {
    const user = await prisma.usuario.findFirst({ where: { correo, estado: 'ACTIVO' } });
    if (!user) return { error: 'Usuario no encontrado', status: 404 };

    if (!user.resetPin || user.resetPin !== pin) {
      return { error: 'El código PIN es incorrecto', status: 400 };
    }
    if (!user.resetPinExpires || user.resetPinExpires < new Date()) {
      return { error: 'El código PIN ha expirado', status: 400 };
    }

    return { success: true };
  },

  async resetearPassword(correo: string, pin: string, nuevaPassword: string) {
    const check = await this.verificarPinRecuperacion(correo, pin);
    if ('error' in check) return check;

    const user = await prisma.usuario.findFirst({ where: { correo, estado: 'ACTIVO' } });
    if (!user) return { error: 'Usuario no encontrado', status: 404 };

    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        password: hashPassword(nuevaPassword),
        resetPin: null,
        resetPinExpires: null,
        debeCambiarPass: false, // Por si acaso estaba pendiente
      }
    });

    return { success: true };
  },
};