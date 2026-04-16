// backend/src/services/usuarios.service.ts

import { prisma } from '../config/prisma';
import { hashPassword } from '../config/auth';

const USUARIO_SELECT = {
  id: true, nombreCompleto: true, ci: true, correo: true, telefono: true,
  edad: true, fechaIngreso: true, fotoPerfil: true, rol: true, estado: true,
  debeCambiarPass: true, permisoEditarPrendas: true,
  empresaId: true, sucursalId: true,
  sucursal: { select: { nombre: true } },
};

export const usuariosService = {
  async list(empresaId?: string, sucursalId?: string) {
    const where: any = {};
    if (empresaId) where.empresaId = empresaId;
    if (sucursalId) where.sucursalId = sucursalId;

    return prisma.usuario.findMany({
      where,
      select: USUARIO_SELECT,
      orderBy: { fechaIngreso: 'desc' },
    });
  },

  async create(data: any, empresaId: string, defaultSucursalId?: string) {
    return prisma.usuario.create({
      data: {
        nombreCompleto: data.nombreCompleto,
        ci: data.ci,
        correo: data.correo,
        telefono: data.telefono || null,
        edad: data.edad || null,
        password: hashPassword(data.ci),
        debeCambiarPass: true,
        rol: data.rol,
        estado: 'ACTIVO',
        permisoEditarPrendas: data.permisoEditarPrendas || false,
        empresaId,
        sucursalId: data.sucursalId || defaultSucursalId || null,
      },
      select: USUARIO_SELECT,
    });
  },

  async update(id: string, data: any) {
    const { password, empresaId, ...safeData } = data;
    return prisma.usuario.update({
      where: { id },
      data: safeData,
      select: USUARIO_SELECT,
    });
  },

  async remove(id: string) {
    return prisma.usuario.delete({ where: { id } });
  },

  async findById(id: string) {
    return prisma.usuario.findUnique({ where: { id } });
  },
};