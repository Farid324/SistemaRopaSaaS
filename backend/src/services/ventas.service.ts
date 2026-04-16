// backend/src/services/ventas.service.ts

import { prisma } from '../config/prisma';
import { MetodoPago } from '@prisma/client';

interface ListFilters {
  empresaId?: string;
  sucursalId?: string;
  vendedorId?: string;
}

interface CrearVentaData {
  empresaId: string;
  sucursalId: string;
  vendedorId: string;
  prendaIds: string[];
  metodosPago?: { metodo: MetodoPago; monto: number }[];
}

export const ventasService = {
  async list(filters: ListFilters) {
    const where: any = {};
    if (filters.empresaId) where.empresaId = filters.empresaId;
    if (filters.sucursalId) where.sucursalId = filters.sucursalId;
    if (filters.vendedorId) where.vendedorId = filters.vendedorId;

    return prisma.venta.findMany({
      where,
      include: {
        vendedor: { select: { nombreCompleto: true, rol: true } },
        sucursal: { select: { nombre: true } },
        detallesPrendas: {
          include: {
            prenda: {
              select: {
                id: true, codigo: true, marca: true, tipo: true,
                foto: true, precio: true, rebaja: true, detalles: true,
              },
            },
          },
        },
        metodosDePago: true,
      },
      orderBy: { fecha: 'desc' },
    });
  },

  async crear(data: CrearVentaData) {
    const prendas = await prisma.prenda.findMany({
      where: { id: { in: data.prendaIds }, estadoVenta: 'DISPONIBLE', empresaId: data.empresaId },
    });

    if (prendas.length !== data.prendaIds.length) {
      throw new Error('Algunas prendas no están disponibles');
    }

    const totalCobrado = prendas.reduce((sum, p) => sum + (p.rebaja || p.precio), 0);

    if (data.metodosPago && data.metodosPago.length > 0) {
      const totalPagos = data.metodosPago.reduce((sum, mp) => sum + mp.monto, 0);
      if (Math.abs(totalPagos - totalCobrado) > 0.01) {
        throw new Error(`Los pagos (Bs ${totalPagos}) no coinciden con el total (Bs ${totalCobrado})`);
      }
    }

    return prisma.$transaction(async (tx) => {
      const nuevaVenta = await tx.venta.create({
        data: {
          totalCobrado,
          empresaId: data.empresaId,
          sucursalId: data.sucursalId,
          vendedorId: data.vendedorId,
          detallesPrendas: {
            create: prendas.map((p) => ({
              prendaId: p.id,
              precioVendido: p.rebaja || p.precio,
            })),
          },
          metodosDePago: {
            create: data.metodosPago && data.metodosPago.length > 0
              ? data.metodosPago.map((mp) => ({ metodo: mp.metodo, monto: mp.monto }))
              : [{ metodo: 'EFECTIVO' as MetodoPago, monto: totalCobrado }],
          },
        },
        include: {
          detallesPrendas: { include: { prenda: true } },
          metodosDePago: true,
          vendedor: { select: { nombreCompleto: true } },
        },
      });

      await tx.prenda.updateMany({
        where: { id: { in: data.prendaIds } },
        data: { estadoVenta: 'VENDIDO' },
      });

      return nuevaVenta;
    });
  },
};