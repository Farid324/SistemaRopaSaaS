// backend/src/controllers/web/auth.web.controller.ts

import { Request, Response } from 'express';
import { authService } from '../../services/auth.service';

export const authWebController = {
  // ════════════ REGISTRO CLIENTE (B2C) ════════════
  async registrarCliente(req: Request, res: Response) {
    try {
      const { correo, password, nombreCompleto } = req.body;
      if (!correo || !password || !nombreCompleto) {
        return res.status(400).json({ message: 'Correo, contraseña y nombre completo son requeridos' });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener mínimo 6 caracteres' });
      }
      if (nombreCompleto.trim().length < 3) {
        return res.status(400).json({ message: 'El nombre completo debe tener al menos 3 caracteres' });
      }
      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        return res.status(400).json({ message: 'Formato de correo inválido' });
      }

      const result = await authService.registrarCliente(correo, password, nombreCompleto.trim());
      if ('error' in result) return res.status(result.status || 500).json({ message: result.error });

      res.status(201).json(result);
    } catch (error) {
      console.error('Registrar cliente error:', error);
      res.status(500).json({ message: 'Error al registrar cliente' });
    }
  },

  // ════════════ VERIFICAR EMAIL ════════════
  async verificarEmail(req: Request, res: Response) {
    try {
      const { correo, pin } = req.body;
      if (!correo || !pin) return res.status(400).json({ message: 'Correo y código de verificación requeridos' });

      const result = await authService.verificarEmailCliente(correo, pin);
      if ('error' in result) return res.status(result.status || 400).json({ message: result.error });

      res.json(result);
    } catch (error) {
      console.error('Verificar email error:', error);
      res.status(500).json({ message: 'Error al verificar correo' });
    }
  },

  // ════════════ REENVIAR VERIFICACIÓN ════════════
  async reenviarVerificacion(req: Request, res: Response) {
    try {
      const { correo } = req.body;
      if (!correo) return res.status(400).json({ message: 'Correo requerido' });

      const result = await authService.reenviarVerificacion(correo);
      if ('error' in result) return res.status(result.status || 400).json({ message: result.error });

      res.json(result);
    } catch (error) {
      console.error('Reenviar verificación error:', error);
      res.status(500).json({ message: 'Error al reenviar código' });
    }
  },

  // ════════════ LOGIN CLIENTE (B2C) ════════════
  async loginCliente(req: Request, res: Response) {
    try {
      const { correo, password } = req.body;
      if (!correo || !password) return res.status(400).json({ message: 'Correo y contraseña requeridos' });

      const result = await authService.loginCliente(correo, password);
      if ('error' in result) {
        return res.status(result.status || 500).json({ 
          message: result.error, 
          requiresVerification: (result as any).requiresVerification || false,
        });
      }

      res.json(result);
    } catch (error) {
      console.error('Login cliente error:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // ════════════ GOOGLE AUTH (B2C) ════════════
  async googleAuth(req: Request, res: Response) {
    try {
      const { googleId, correo, nombreCompleto, fotoPerfil } = req.body;
      if (!googleId || !correo || !nombreCompleto) {
        return res.status(400).json({ message: 'Datos de Google incompletos' });
      }

      const result = await authService.googleAuth(googleId, correo, nombreCompleto, fotoPerfil);
      if ('error' in result) return res.status(result.status || 500).json({ message: result.error });

      res.json(result);
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({ message: 'Error en autenticación con Google' });
    }
  },
  
  // ════════════ RECUPERACIÓN DE CONTRASEÑA CLIENTE ════════════
  async forgotPassword(req: Request, res: Response) {
    try {
      const { correo } = req.body;
      if (!correo) return res.status(400).json({ message: 'Correo requerido' });

      const result = await authService.generarPinRecuperacion(correo);
      if ('error' in result) return res.status(result.status || 500).json({ message: result.error });

      res.json({ message: 'PIN enviado al correo' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Error al solicitar PIN' });
    }
  },

  async verifyPin(req: Request, res: Response) {
    try {
      const { correo, pin } = req.body;
      if (!correo || !pin) return res.status(400).json({ message: 'Correo y PIN requeridos' });

      const result = await authService.verificarPinRecuperacion(correo, pin);
      if ('error' in result) return res.status(result.status || 400).json({ message: result.error });

      res.json({ message: 'PIN verificado correctamente' });
    } catch (error) {
      console.error('Verify PIN error:', error);
      res.status(500).json({ message: 'Error al verificar PIN' });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { correo, pin, nuevaPassword } = req.body;
      if (!correo || !pin || !nuevaPassword) {
        return res.status(400).json({ message: 'Correo, PIN y nueva contraseña requeridos' });
      }
      if (nuevaPassword.length < 6) {
        return res.status(400).json({ message: 'Mínimo 6 caracteres' });
      }

      const result = await authService.resetearPassword(correo, pin, nuevaPassword);
      if ('error' in result) return res.status(result.status || 400).json({ message: result.error });

      res.json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Error al restablecer contraseña' });
    }
  },

  // ════════════ ONBOARDING: UPGRADE A OWNER ════════════
  async upgradeToOwner(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'No autenticado' });

      const { nombreEmpresa, planId, ci, telefono, edad } = req.body;
      
      if (!nombreEmpresa || !planId || !ci) {
        return res.status(400).json({ message: 'Faltan datos obligatorios (Empresa, Plan o CI)' });
      }

      const extraData = {
        ci,
        telefono,
        edad: edad ? parseInt(edad) : undefined,
      };

      const result = await authService.convertirAEmpresa(userId, nombreEmpresa, planId, extraData);
      
      if ('error' in result) {
        return res.status(result.status || 400).json({ message: result.error });
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Upgrade to owner error:', error);
      res.status(500).json({ message: 'Error al crear la cuenta de empresa' });
    }
  },
};
