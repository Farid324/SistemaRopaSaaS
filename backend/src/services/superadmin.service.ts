import { prisma } from '../config/prisma';
import { generateToken, hashPassword, comparePassword } from '../config/auth';
import { Rol, EstadoGeneral } from '@prisma/client';

export const superAdminService = {
  // 1. Iniciar sesión de Super Admin
  async login(correo: string, password: string) {
    const user = await prisma.usuario.findFirst({
      where: { correo, rol: Rol.SUPER_ADMIN, empresaId: null },
    });

    if (!user) return { error: 'Credenciales incorrectas o no eres Super Admin', status: 401 };
    if (!comparePassword(password, user.password)) return { error: 'Credenciales incorrectas', status: 401 };

    const token = generateToken({
      userId: user.id,
      empresaId: null,
      rol: Rol.SUPER_ADMIN,
    });

    const { password: _, ...userData } = user;
    return { token, user: userData };
  },

  // 2. Obtener empresas
  async getEmpresas() {
    return await prisma.empresa.findMany({
      include: {
        plan: true,
        usuarios: {
          where: { rol: 'OWNER_PRINCIPAL' },
          select: { id: true, nombreCompleto: true, correo: true, telefono: true, ci: true, estado: true }
        }
      },
      orderBy: { fechaRegistro: 'desc' }
    });
  },

  // 3. Aprobar empresa (Cambiar estado de PENDIENTE a ACTIVO)
  async aprobarEmpresa(empresaId: string) {
    const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
    if (!empresa) return { error: 'Empresa no encontrada', status: 404 };
    
    if (empresa.estado === 'ACTIVO') return { error: 'La empresa ya está activa', status: 400 };

    await prisma.$transaction(async (tx) => {
      // Activar empresa
      await tx.empresa.update({
        where: { id: empresaId },
        data: { estado: 'ACTIVO' }
      });

      // Activar usuarios dueños/co-dueños pendientes
      await tx.usuario.updateMany({
        where: { empresaId: empresaId, estado: 'PENDIENTE' },
        data: { estado: 'ACTIVO' }
      });
    });

    const owner = await prisma.usuario.findFirst({ where: { empresaId, rol: 'OWNER_PRINCIPAL' } });
    if (owner) {
      const { sendCompanyApprovalEmail } = require('./email.service');
      await sendCompanyApprovalEmail(owner.correo, empresa.nombre);
    }

    return { success: true, message: 'Empresa aprobada exitosamente' };
  },

  // 4. Rechazar/Revocar empresa (Revierte al Owner a Cliente y elimina empresa)
  async rechazarEmpresa(empresaId: string, motivo?: string) {
    const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
    if (!empresa) return { error: 'Empresa no encontrada', status: 404 };

    const owner = await prisma.usuario.findFirst({ where: { empresaId, rol: 'OWNER_PRINCIPAL' } });

    await prisma.$transaction(async (tx) => {
      if (owner) {
        await tx.usuario.update({
          where: { id: owner.id },
          data: { rol: 'CLIENTE', empresaId: null }
        });
      }
      await tx.usuario.deleteMany({ where: { empresaId } });
      await tx.sucursal.deleteMany({ where: { empresaId } });
      await tx.empresa.delete({ where: { id: empresaId } });
    });

    if (owner) {
      const { sendCompanyRejectionEmail } = require('./email.service');
      await sendCompanyRejectionEmail(owner.correo, empresa.nombre, motivo);
    }

    return { success: true, message: 'Empresa revocada y usuario revertido a Cliente' };
  },

  // 4b. Cambiar Plan de Empresa
  async cambiarPlanEmpresa(empresaId: string, nuevoPlanId: string) {
    const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
    if (!empresa) return { error: 'Empresa no encontrada', status: 404 };

    const plan = await prisma.planSuscripcion.findUnique({ where: { id: nuevoPlanId } });
    if (!plan) return { error: 'Plan no encontrado', status: 404 };

    await prisma.empresa.update({
      where: { id: empresaId },
      data: { planId: nuevoPlanId }
    });

    return { success: true, message: 'Plan actualizado correctamente' };
  },

  // 5. Obtener todos los usuarios de la plataforma (excluyendo Super Admins)
  async getClientes() {
    return await prisma.usuario.findMany({
      where: { rol: { not: 'SUPER_ADMIN' } },
      orderBy: { fechaIngreso: 'desc' },
      select: {
        id: true,
        nombreCompleto: true,
        correo: true,
        ci: true,
        fechaIngreso: true,
        estado: true,
        googleId: true,
        rol: true,
        empresa: {
          select: { nombre: true }
        }
      }
    });
  },

  // 6. Cambiar estado de usuario (Bloquear / Activar)
  async cambiarEstadoUsuario(userId: string, nuevoEstado: EstadoGeneral) {
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) return { error: 'Usuario no encontrado', status: 404 };

    await prisma.usuario.update({
      where: { id: userId },
      data: { estado: nuevoEstado }
    });

    return { success: true, message: `Usuario marcado como ${nuevoEstado}` };
  },

  // 7. Eliminar cliente permanentemente
  async eliminarCliente(userId: string) {
    await prisma.usuario.delete({ where: { id: userId, rol: 'CLIENTE' } });
    return { success: true, message: 'Cliente eliminado permanentemente' };
  }
};
