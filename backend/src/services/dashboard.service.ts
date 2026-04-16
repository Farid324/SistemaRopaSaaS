// backend/src/services/dashboard.service.ts

import { prisma } from '../config/prisma';

export const dashboardService = {
  async getStats(empresaId: string, sucursalId?: string) {
    const pWhere: any = { empresaId };
    const vWhere: any = { empresaId };
    if (sucursalId) {
      pWhere.sucursalId = sucursalId;
      vWhere.sucursalId = sucursalId;
    }

    const [totalPrendas, disponibles, vendidas, reservadas, totalVentas, ingresoTotal] = await Promise.all([
      prisma.prenda.count({ where: pWhere }),
      prisma.prenda.count({ where: { ...pWhere, estadoVenta: 'DISPONIBLE' } }),
      prisma.prenda.count({ where: { ...pWhere, estadoVenta: 'VENDIDO' } }),
      prisma.prenda.count({ where: { ...pWhere, estadoVenta: 'RESERVADO' } }),
      prisma.venta.count({ where: vWhere }),
      prisma.venta.aggregate({ where: vWhere, _sum: { totalCobrado: true } }),
    ]);

    return {
      totalPrendas, disponibles, vendidas, reservadas, totalVentas,
      ingresoTotal: ingresoTotal._sum.totalCobrado || 0,
    };
  },

  async getPlanes() {
    return prisma.planSuscripcion.findMany();
  },
};