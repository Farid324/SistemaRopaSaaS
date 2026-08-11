import { Request, Response } from 'express';
import { superAdminService } from '../../services/superadmin.service';

export const superAdminController = {
  async login(req: Request, res: Response) {
    try {
      const { correo, password } = req.body;
      const result = await superAdminService.login(correo, password);
      
      if ('error' in result) {
        return res.status(result.status || 401).json({ message: result.error });
      }
      res.json(result);
    } catch (e) {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async getEmpresas(req: Request, res: Response) {
    try {
      const empresas = await superAdminService.getEmpresas();
      res.json(empresas);
    } catch (e) {
      res.status(500).json({ message: 'Error al obtener empresas' });
    }
  },

  async aprobarEmpresa(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await superAdminService.aprobarEmpresa(id);
      if ('error' in result) return res.status(result.status || 400).json({ message: result.error });
      res.json(result);
    } catch (e) {
      res.status(500).json({ message: 'Error al aprobar empresa' });
    }
  },

  async rechazarEmpresa(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { motivo } = req.body;
      const result = await superAdminService.rechazarEmpresa(id, motivo);
      res.json(result);
    } catch (e) {
      res.status(500).json({ message: 'Error al rechazar empresa' });
    }
  },

  async cambiarPlanEmpresa(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { planId } = req.body;
      const result = await superAdminService.cambiarPlanEmpresa(id, planId);
      if ('error' in result) return res.status(result.status || 400).json({ message: result.error });
      res.json(result);
    } catch (e) {
      res.status(500).json({ message: 'Error al cambiar plan' });
    }
  },

  async getClientes(req: Request, res: Response) {
    try {
      const clientes = await superAdminService.getClientes();
      res.json(clientes);
    } catch (e) {
      res.status(500).json({ message: 'Error al obtener clientes' });
    }
  },

  async cambiarEstadoUsuario(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { estado } = req.body; // ACTIVO, BLOQUEADO
      const result = await superAdminService.cambiarEstadoUsuario(id, estado);
      if ('error' in result) return res.status(result.status || 400).json({ message: result.error });
      res.json(result);
    } catch (e) {
      res.status(500).json({ message: 'Error al cambiar estado' });
    }
  },

  async eliminarCliente(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await superAdminService.eliminarCliente(id);
      res.json(result);
    } catch (e) {
      res.status(500).json({ message: 'Error al eliminar cliente' });
    }
  }
};
