// backend/src/services/prendas.service.ts

import { prisma } from '../config/prisma';

interface ListFilters {
  empresaId?: string;
  sucursalId?: string;
  estadoVenta?: string;
  search?: string;
}

export const prendasService = {
  async list(filters: ListFilters) {
    const where: any = {};
    if (filters.empresaId) where.empresaId = filters.empresaId;
    if (filters.sucursalId) where.sucursalId = filters.sucursalId;
    if (filters.estadoVenta) where.estadoVenta = filters.estadoVenta;
    if (filters.search) {
      where.OR = [
        { marca: { contains: filters.search, mode: 'insensitive' } },
        { tipo: { contains: filters.search, mode: 'insensitive' } },
        { codigo: { contains: filters.search, mode: 'insensitive' } },
        { detalles: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.prenda.findMany({
      where,
      include: { sucursal: { select: { nombre: true } } },
      orderBy: { id: 'desc' },
    });
  },

  async findByCodigo(codigo: string) {
    return prisma.prenda.findUnique({
      where: { codigo },
      include: { sucursal: { select: { nombre: true } } },
    });
  },

  async create(data: any, empresaId: string, sucursalId?: string) {
    return prisma.prenda.create({
      data: { ...data, empresaId, sucursalId },
    });
  },

  async update(id: string, data: any) {
    return prisma.prenda.update({ where: { id }, data });
  },

  async remove(id: string) {
    return prisma.prenda.delete({ where: { id } });
  },
};