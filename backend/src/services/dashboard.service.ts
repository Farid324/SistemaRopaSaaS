// backend/src/services/dashboard.service.ts

import { prisma } from '../config/prisma';

export const dashboardService = {
  // ── Stats generales ──────────────────────────────────────────────────────────
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

  // ── Planes disponibles ────────────────────────────────────────────────────────
  async getPlanes() {
    return prisma.planSuscripcion.findMany();
  },

  // ── Plan actual de la empresa ─────────────────────────────────────────────────
  async getPlanActual(empresaId: string) {
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      include: { plan: true },
    });
    if (!empresa) throw new Error('Empresa no encontrada');
    return empresa.plan;
  },

  // ── Verificar límites del plan ────────────────────────────────────────────────
  async verificarLimitePlan(empresaId: string, tipo: string, cantidad = 1) {
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      include: { plan: true },
    });
    if (!empresa) throw new Error('Empresa no encontrada');

    const plan = empresa.plan;
    let actual = 0;
    let limite = -1; // -1 = ilimitado

    switch (tipo) {
      case 'sucursales':
        actual = await prisma.sucursal.count({ where: { empresaId } });
        limite = plan.limiteSucursal;
        break;
      case 'empleados':
        actual = await prisma.usuario.count({ where: { empresaId } });
        limite = plan.limiteEmpleados;
        break;
      case 'prendas':
        actual = await prisma.prenda.count({ where: { empresaId } });
        limite = plan.limitePrendas;
        break;
      default:
        throw new Error(`Tipo desconocido: ${tipo}`);
    }

    const permitido = limite === -1 || actual + cantidad <= limite;
    return {
      permitido,
      actual,
      limite,
      planNombre: plan.nombre,
      mensaje: permitido
        ? 'Dentro del límite'
        : `Has alcanzado el límite de ${tipo} (${actual}/${limite}) en el plan ${plan.nombre}.`,
    };
  },

  // ── Datos para reporte ────────────────────────────────────────────────────────
  async getReporteData(empresaId: string, sucursalId?: string, desde?: Date, hasta?: Date) {
    const pWhere: any = { empresaId };
    const vWhere: any = { empresaId };

    if (sucursalId) {
      pWhere.sucursalId = sucursalId;
      vWhere.sucursalId = sucursalId;
    }
    if (desde || hasta) {
      vWhere.fecha = {};
      if (desde) vWhere.fecha.gte = desde;
      if (hasta) vWhere.fecha.lte = hasta;
    }

    const [prendas, ventas] = await Promise.all([
      prisma.prenda.findMany({ where: pWhere }),
      prisma.venta.findMany({
        where: vWhere,
        include: {
          detallesPrendas: { include: { prenda: true } },
          metodosDePago: true,
          vendedor: { select: { nombreCompleto: true } },
        },
      }),
    ]);

    return { prendas, ventas };
  },

  // ── Importar prendas masivo ───────────────────────────────────────────────────
  async importarPrendasMasivo(
    prendas: Array<Record<string, any>>,
    empresaId: string,
    sucursalId?: string | null,
  ) {
    const data: any[] = prendas.map((p) => ({
      ...p,
      empresaId,
      sucursalId: sucursalId ?? p.sucursalId,
    }));

    const created = await prisma.prenda.createMany({ data, skipDuplicates: true });
    return { creadas: created.count };
  },
};