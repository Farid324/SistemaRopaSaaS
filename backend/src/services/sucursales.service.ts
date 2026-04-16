// backend/src/services/sucursales.service.ts

import { prisma } from '../config/prisma';

export const sucursalesService = {
  async list(empresaId?: string) {
    return prisma.sucursal.findMany({
      where: empresaId ? { empresaId } : {},
      include: { _count: { select: { usuarios: true, prendas: true } } },
      orderBy: { nombre: 'asc' },
    });
  },

  async create(data: any, empresaId: string) {
    return prisma.sucursal.create({ data: { ...data, empresaId } });
  },

  async update(id: string, data: any) {
    return prisma.sucursal.update({ where: { id }, data });
  },

  async remove(id: string) {
    return prisma.sucursal.delete({ where: { id } });
  },
};