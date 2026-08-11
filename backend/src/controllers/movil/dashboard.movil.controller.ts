// backend/src/controllers/dashboard.controller.ts  (REEMPLAZA el existente)

import { Request, Response } from 'express';
import { dashboardService } from '../../services/dashboard.service';
import { isOwnerRole } from '../../shared/helpers';

export const dashboardController = {
  // ═══════════════════ PUNTO 2: Stats filtradas por sucursal ═══════════════════
  async stats(req: Request, res: Response) {
    try {
      const user = req.user!;
      // Si es Owner y manda ?sucursalId=xxx, filtra por esa sucursal
      // Si no es Owner, fuerza su propia sucursal
      let sucursalId: string | undefined;

      if (isOwnerRole(user.rol)) {
        const querySuc = req.query.sucursalId as string | undefined;
        sucursalId = querySuc && querySuc !== 'ALL' ? querySuc : undefined;
      } else {
        sucursalId = user.sucursalId || undefined;
      }

      const stats = await dashboardService.getStats(user.empresaId!, sucursalId);
      res.json(stats);
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
  },

  // ═══════════════════ PUNTO 6: Plan real del backend ═══════════════════
  async planActual(req: Request, res: Response) {
    try {
      const user = req.user!;
      const plan = await dashboardService.getPlanActual(user.empresaId!);
      res.json(plan);
    } catch (error) {
      console.error('Plan actual error:', error);
      res.status(500).json({ message: 'Error al obtener plan' });
    }
  },

  async planes(_req: Request, res: Response) {
    try {
      const planes = await dashboardService.getPlanes();
      res.json(planes);
    } catch (error) {
      console.error('Planes error:', error);
      res.status(500).json({ message: 'Error al obtener planes' });
    }
  },

  // ═══════════════════ PUNTO 5: Validaciones de plan ═══════════════════
  async verificarLimite(req: Request, res: Response) {
    try {
      const user = req.user!;
      const { tipo } = req.query; // 'sucursales' | 'empleados' | 'prendas'
      if (!tipo) return res.status(400).json({ message: 'Tipo requerido (sucursales|empleados|prendas)' });

      const result = await dashboardService.verificarLimitePlan(user.empresaId!, tipo as string);

      if (!result.permitido) {
        // Si el usuario es Owner, sugerir upgrade
        if (isOwnerRole(user.rol)) {
          return res.status(403).json({
            message: result.mensaje,
            limitado: true,
            sugerirUpgrade: true,
            planActual: result.planNombre,
            actual: result.actual,
            limite: result.limite,
          });
        } else {
          return res.status(403).json({
            message: 'No se puede crear. Contacta al dueño de la empresa para aumentar el plan.',
            limitado: true,
            sugerirUpgrade: false,
          });
        }
      }

      res.json({ permitido: true, actual: result.actual, limite: result.limite });
    } catch (error) {
      console.error('Verificar limite error:', error);
      res.status(500).json({ message: 'Error al verificar límite' });
    }
  },

  // ═══════════════════ PUNTO 3: Reporte PDF (datos para generar en frontend) ═══════════════════
  async reporteData(req: Request, res: Response) {
    try {
      const user = req.user!;
      const { desde, hasta, sucursalId: querySuc } = req.query;

      let sucursalId: string | undefined;
      if (isOwnerRole(user.rol)) {
        sucursalId = querySuc && querySuc !== 'ALL' ? querySuc as string : undefined;
      } else {
        sucursalId = user.sucursalId || undefined;
      }

      const data = await dashboardService.getReporteData(
        user.empresaId!,
        sucursalId,
        desde ? new Date(desde as string) : undefined,
        hasta ? new Date(hasta as string) : undefined,
      );

      res.json(data);
    } catch (error) {
      console.error('Reporte data error:', error);
      res.status(500).json({ message: 'Error al obtener datos del reporte' });
    }
  },

  // ═══════════════════ PUNTO 4: Importar prendas masivo ═══════════════════
  async importarPrendas(req: Request, res: Response) {
    try {
      const user = req.user!;
      const { prendas } = req.body;

      if (!Array.isArray(prendas) || prendas.length === 0) {
        return res.status(400).json({ message: 'Debe enviar un array de prendas' });
      }

      // Verificar límite antes de importar
      const check = await dashboardService.verificarLimitePlan(user.empresaId!, 'prendas', prendas.length);
      if (!check.permitido) {
        return res.status(403).json({
          message: check.mensaje,
          limitado: true,
          sugerirUpgrade: isOwnerRole(user.rol),
        });
      }

      const result = await dashboardService.importarPrendasMasivo(
        prendas,
        user.empresaId!,
        isOwnerRole(user.rol) ? undefined : user.sucursalId
      );

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Importar prendas error:', error);
      res.status(500).json({ message: error.message || 'Error al importar prendas' });
    }
  },
};