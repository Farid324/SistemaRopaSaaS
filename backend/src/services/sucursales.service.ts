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

  /*async remove(id: string) {
    return prisma.sucursal.delete({ where: { id } });
  },*/
  
  async remove(id: string) {
    // Verificar si tiene prendas o usuarios asignados
    const counts = await prisma.sucursal.findUnique({
      where: { id },
      include: { _count: { select: { prendas: true, usuarios: true } } },
    });

    if (!counts) throw { code: 'NOT_FOUND', message: 'Sucursal no encontrada' };

    // Desasignar usuarios de esta sucursal (quedan sin sucursal)
    await prisma.usuario.updateMany({
      where: { sucursalId: id },
      data: { sucursalId: null },
    });

    // Eliminar prendas de esta sucursal (o moverlas — por ahora eliminamos)
    await prisma.prenda.deleteMany({
      where: { sucursalId: id },
    });

    return prisma.sucursal.delete({ where: { id } });
  },
};