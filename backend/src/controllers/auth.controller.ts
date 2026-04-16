// backend/src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const { correo, password } = req.body;
      if (!correo || !password) return res.status(400).json({ message: 'Correo y contraseña requeridos' });

      const result = await authService.login(correo, password);
      if ('error' in result) return res.status(result.status || 500).json({ message: result.error });

      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  async cambiarPassword(req: Request, res: Response) {
    try {
      const { nuevaPassword } = req.body;
      if (!nuevaPassword) return res.status(400).json({ message: 'Contraseña requerida' });
      if (nuevaPassword.length < 6) return res.status(400).json({ message: 'Mínimo 6 caracteres' });

      const result = await authService.cambiarPassword(req.user!.userId, nuevaPassword);
      res.json({ ...result, message: 'Contraseña actualizada' });
    } catch (error) {
      console.error('Cambiar password error:', error);
      res.status(500).json({ message: 'Error al cambiar contraseña' });
    }
  },

  async me(req: Request, res: Response) {
    try {
      const user = await authService.getPerfil(req.user!.userId);
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
      res.json(user);
    } catch (error) {
      console.error('Me error:', error);
      res.status(500).json({ message: 'Error al obtener perfil' });
    }
  },
};