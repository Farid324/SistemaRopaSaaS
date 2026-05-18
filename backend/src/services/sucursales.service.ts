// backend/src/services/sucursales.service.ts

import { prisma } from '../config/prisma';

export const sucursalesService = {
  async list(empresaId?: string) {
    return prisma.sucursal.findMany({
      where: empresaId ? { empresaId } : {},
      include: { _count: { select: { usuarios: true, prendas: true, ventas: true } } },
      orderBy: { nombre: 'asc' },
    });
  },

  async create(data: any, empresaId: string) {
    return prisma.sucursal.create({ data: { ...data, empresaId } });
  },

  async update(id: string, data: any) {
    return prisma.sucursal.update({ where: { id }, data });
  },

  /**
   * Obtiene conteos de datos asociados para mostrar en el modal de eliminación.
   */
  async getDeleteInfo(id: string) {
    const sucursal = await prisma.sucursal.findUnique({
      where: { id },
      include: {
        _count: { select: { usuarios: true, prendas: true, ventas: true } },
      },
    });

    if (!sucursal) throw { code: 'NOT_FOUND', message: 'Sucursal no encontrada' };

    return {
      id: sucursal.id,
      nombre: sucursal.nombre,
      usuarios: sucursal._count.usuarios,
      prendas: sucursal._count.prendas,
      ventas: sucursal._count.ventas,
    };
  },

  /**
   * Obtiene las prendas y ventas de una sucursal para exportar antes de eliminar.
   */
  async getExportData(id: string) {
    const [prendas, ventas] = await Promise.all([
      prisma.prenda.findMany({
        where: { sucursalId: id },
        select: {
          codigo: true, marca: true, tipo: true, detalles: true,
          estado: true, precio: true, rebaja: true, estadoVenta: true,
        },
      }),
      prisma.venta.findMany({
        where: { sucursalId: id },
        include: {
          vendedor: { select: { nombreCompleto: true } },
          detallesPrendas: {
            include: {
              prenda: { select: { codigo: true, tipo: true, marca: true } },
            },
          },
          metodosDePago: true,
        },
        orderBy: { fecha: 'desc' },
      }),
    ]);

    return { prendas, ventas };
  },

  /**
   * Elimina una sucursal y todos sus datos asociados en cascada.
   * Orden: PagoVenta → DetalleVenta (de ventas) → Venta → DetalleVenta (de prendas) → Prenda → desasignar Usuarios → Sucursal
   */
  async remove(id: string) {
    const sucursal = await prisma.sucursal.findUnique({
      where: { id },
      include: { _count: { select: { prendas: true, usuarios: true, ventas: true } } },
    });

    if (!sucursal) throw { code: 'NOT_FOUND', message: 'Sucursal no encontrada' };

    // Obtener IDs ANTES de la transacción (reads, no necesitan estar dentro)
    const ventaIds = (
      await prisma.venta.findMany({ where: { sucursalId: id }, select: { id: true } })
    ).map((v) => v.id);

    const prendaIds = (
      await prisma.prenda.findMany({ where: { sucursalId: id }, select: { id: true } })
    ).map((p) => p.id);

    // Solo operaciones de escritura dentro de la transacción
    return prisma.$transaction(async (tx) => {
      // 1. Eliminar PagoVenta de las ventas de esta sucursal
      if (ventaIds.length > 0) {
        await tx.pagoVenta.deleteMany({ where: { ventaId: { in: ventaIds } } });
      }

      // 2. Eliminar DetalleVenta de las ventas de esta sucursal
      if (ventaIds.length > 0) {
        await tx.detalleVenta.deleteMany({ where: { ventaId: { in: ventaIds } } });
      }

      // 3. Eliminar Ventas de esta sucursal
      if (ventaIds.length > 0) {
        await tx.venta.deleteMany({ where: { id: { in: ventaIds } } });
      }

      // 4. Eliminar DetalleVenta de prendas de esta sucursal (por si hay ventas cruzadas)
      if (prendaIds.length > 0) {
        await tx.detalleVenta.deleteMany({ where: { prendaId: { in: prendaIds } } });
      }

      // 5. Eliminar prendas de esta sucursal
      await tx.prenda.deleteMany({ where: { sucursalId: id } });

      // 6. Desasignar usuarios (quedan sin sucursal, no se eliminan)
      await tx.usuario.updateMany({
        where: { sucursalId: id },
        data: { sucursalId: null },
      });

      // 7. Eliminar la sucursal
      return tx.sucursal.delete({ where: { id } });
    }, { timeout: 30000 });
  },

  // ═══════════════════ Sucursal por defecto ═══════════════════
  async crearSucursalPorDefecto(empresaId: string, nombreEmpresa: string) {
    return prisma.sucursal.create({
      data: {
        nombre: `Casa Matriz - ${nombreEmpresa}`,
        direccion: '',
        detalles: 'Sucursal principal creada automáticamente',
        horarios: '08:00 - 20:00',
        maxAdministradores: 2,
        estado: 'ACTIVO',
        empresaId,
      },
    });
  },
};