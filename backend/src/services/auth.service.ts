// backend/src/services/auth.service.ts

import { prisma } from '../config/prisma';
import { generateToken, hashPassword, comparePassword } from '../config/auth';
import { sendPinEmail, sendVerificationEmail } from './email.service';

export const authService = {
  async login(correo: string, password: string) {
    // Buscar el usuario ACTIVO con ese correo que NO sea CLIENTE (solo staff/B2B)
    const user = await prisma.usuario.findFirst({ 
      where: { 
        correo, 
        estado: 'ACTIVO',
        rol: { not: 'CLIENTE' } 
      },
      include: {
        sucursal: { select: { nombre: true } },
        empresa: { select: { nombre: true, planId: true } },
      }
    });

    if (!user) {
      const isClient = await prisma.usuario.findFirst({ where: { correo, rol: 'CLIENTE' } });
      if (isClient) {
        return { error: 'La app móvil es exclusiva para tiendas. Registra tu empresa en la web primero.', status: 403 };
      }
      return { error: 'Credenciales incorrectas', status: 401 };
    }

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

  // ════════════ REGISTRO CLIENTE (B2C) ════════════
  async registrarCliente(correo: string, password: string, nombreCompleto: string) {
    // Verificar si ya existe un usuario con ese correo
    const existe = await prisma.usuario.findFirst({ where: { correo }, orderBy: { fechaIngreso: 'asc' } });
    if (existe) {
      if (existe.emailVerificado) {
        return { error: 'El correo ya está registrado', status: 400 };
      }
      // Si existe pero no verificó, re-enviar PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 15);
      
      await prisma.usuario.update({
        where: { id: existe.id },
        data: { 
          password: hashPassword(password),
          nombreCompleto,
          verificationPin: pin, 
          verificationPinExpires: expires,
        },
      });

      await sendVerificationEmail(correo, pin, nombreCompleto).catch(e => 
        console.error('Error al enviar verificación:', e)
      );

      return { message: 'Código de verificación reenviado', requiresVerification: true };
    }

    // Generar PIN de verificación
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    const nuevoCliente = await prisma.usuario.create({
      data: {
        correo,
        password: hashPassword(password),
        nombreCompleto,
        ci: 'CLIENTE-' + Date.now(),
        rol: 'CLIENTE',
        debeCambiarPass: false,
        emailVerificado: false,
        verificationPin: pin,
        verificationPinExpires: expires,
      }
    });

    // Enviar correo de verificación
    await sendVerificationEmail(correo, pin, nombreCompleto).catch(e => 
      console.error('Error al enviar verificación:', e)
    );

    const { password: _, ...userData } = nuevoCliente;
    return { user: userData, requiresVerification: true, message: 'Código de verificación enviado' };
  },

  // ════════════ VERIFICAR EMAIL ════════════
  async verificarEmailCliente(correo: string, pin: string) {
    const user = await prisma.usuario.findFirst({ where: { correo }, orderBy: { fechaIngreso: 'asc' } });
    if (!user) return { error: 'Usuario no encontrado', status: 404 };

    if (user.emailVerificado) return { error: 'El correo ya fue verificado', status: 400 };

    if (!user.verificationPin || user.verificationPin !== pin) {
      return { error: 'El código de verificación es incorrecto', status: 400 };
    }
    if (!user.verificationPinExpires || user.verificationPinExpires < new Date()) {
      return { error: 'El código de verificación ha expirado. Solicita uno nuevo.', status: 400 };
    }

    const updated = await prisma.usuario.update({
      where: { id: user.id },
      data: { 
        emailVerificado: true, 
        verificationPin: null, 
        verificationPinExpires: null,
        estado: 'ACTIVO',
      },
    });

    const token = generateToken({
      userId: updated.id,
      empresaId: updated.empresaId,
      rol: updated.rol,
    });

    const { password: _, ...userData } = updated;
    return { token, user: userData, message: 'Correo verificado correctamente' };
  },

  // ════════════ REENVIAR VERIFICACIÓN ════════════
  async reenviarVerificacion(correo: string) {
    const user = await prisma.usuario.findFirst({ where: { correo }, orderBy: { fechaIngreso: 'asc' } });
    if (!user) return { error: 'Usuario no encontrado', status: 404 };
    if (user.emailVerificado) return { error: 'El correo ya fue verificado', status: 400 };

    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    await prisma.usuario.update({
      where: { id: user.id },
      data: { verificationPin: pin, verificationPinExpires: expires },
    });

    await sendVerificationEmail(correo, pin, user.nombreCompleto).catch(e => 
      console.error('Error al reenviar verificación:', e)
    );

    return { success: true, message: 'Código de verificación reenviado' };
  },

  // ════════════ LOGIN CLIENTE (B2C) ════════════
  async loginCliente(correo: string, password: string) {
    const user = await prisma.usuario.findFirst({ 
      where: { correo },
      orderBy: { fechaIngreso: 'asc' }
    });
    if (!user) return { error: 'Credenciales incorrectas', status: 401 };
    if (user.estado !== 'ACTIVO') return { error: 'Cuenta bloqueada', status: 403 };

    if (!comparePassword(password, user.password)) {
      return { error: 'Credenciales incorrectas', status: 401 };
    }

    if (!user.emailVerificado) {
      return { error: 'Debes verificar tu correo antes de iniciar sesión', status: 403, requiresVerification: true };
    }

    const token = generateToken({
      userId: user.id,
      empresaId: user.empresaId,
      rol: user.rol,
    });

    const { password: _, ...userData } = user;
    return { token, user: userData };
  },

  // ════════════ GOOGLE AUTH (B2C) ════════════
  async googleAuth(googleId: string, correo: string, nombreCompleto: string, fotoPerfil?: string) {
    // Buscar por googleId primero
    let user = await prisma.usuario.findFirst({ where: { googleId } });
    
    if (!user) {
      // Buscar por correo sin importar el rol
      user = await prisma.usuario.findFirst({ where: { correo }, orderBy: { fechaIngreso: 'asc' } });
      
      if (user) {
        // Vincular Google ID al usuario existente
        user = await prisma.usuario.update({
          where: { id: user.id },
          data: { 
            googleId, 
            emailVerificado: true, // Google verifica el email
            fotoPerfil: fotoPerfil || user.fotoPerfil,
          },
        });
      } else {
        // Crear nuevo usuario
        user = await prisma.usuario.create({
          data: {
            correo,
            password: hashPassword('google-' + Date.now() + '-' + Math.random()),
            nombreCompleto,
            ci: 'GOOGLE-' + Date.now(),
            rol: 'CLIENTE',
            debeCambiarPass: false,
            emailVerificado: true,
            googleId,
            fotoPerfil: fotoPerfil || null,
          },
        });
      }
    }

    if (user.estado !== 'ACTIVO') return { error: 'Cuenta bloqueada', status: 403 };

    const token = generateToken({
      userId: user.id,
      empresaId: user.empresaId,
      rol: user.rol,
      sucursalId: user.sucursalId || undefined,
    });

    const { password: _, ...userData } = user;
    return { token, user: userData };
  },

  // ════════════ CONVERTIR CLIENTE A OWNER (B2B) ════════════
  async convertirAEmpresa(userId: string, nombreEmpresa: string, planId: string, extraData: { ci: string, telefono?: string, edad?: number }) {
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) return { error: 'Usuario no encontrado', status: 404 };
    if (user.rol !== 'CLIENTE') return { error: 'El usuario ya pertenece a una empresa', status: 400 };

    // Crear Empresa, Sucursal principal y actualizar al usuario en una sola transacción
    const resultado = await prisma.$transaction(async (tx) => {
      const nuevaEmpresa = await tx.empresa.create({
        data: {
          nombre: nombreEmpresa,
          planId: planId,
          estado: 'PENDIENTE',
        }
      });

      const nuevaSucursal = await tx.sucursal.create({
        data: {
          nombre: 'Sucursal Principal',
          empresaId: nuevaEmpresa.id,
        }
      });

      const userActualizado = await tx.usuario.update({
        where: { id: userId },
        data: {
          rol: 'OWNER_PRINCIPAL',
          empresaId: nuevaEmpresa.id,
          sucursalId: nuevaSucursal.id,
          estado: 'PENDIENTE',
          ci: extraData.ci,
          telefono: extraData.telefono || user.telefono,
          edad: extraData.edad || user.edad,
        }
      });

      return { nuevaEmpresa, nuevaSucursal, userActualizado };
    });

    const { password: _, ...userData } = resultado.userActualizado;
    return { 
      user: userData, 
      empresa: resultado.nuevaEmpresa,
      message: 'Solicitud enviada exitosamente. Tu empresa será revisada y activada pronto por un administrador.',
      isPending: true
    };
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