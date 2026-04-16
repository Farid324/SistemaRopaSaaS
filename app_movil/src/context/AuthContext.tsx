// app_movil/src/context/AuthContext.tsx  (REEMPLAZA el existente)

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api, { tokenStorage } from '../services/api';

// ── Types que coinciden con el schema.prisma ──
export type Rol = 'SUPER_ADMIN' | 'OWNER_PRINCIPAL' | 'CO_OWNER' | 'ADMINISTRADOR' | 'EMPLEADO';
export type EstadoGeneral = 'ACTIVO' | 'BLOQUEADO' | 'CERRADO';

export interface Usuario {
  id: string;
  nombreCompleto: string;
  ci: string;
  correo: string;
  telefono?: string;
  edad?: number;
  fechaIngreso?: string;
  fotoPerfil?: string;
  rol: Rol;
  estado: EstadoGeneral;
  debeCambiarPass: boolean;
  permisoEditarPrendas?: boolean;
  empresaId: string;
  sucursalId?: string;
  sucursal?: { nombre: string };
  empresa?: { nombre: string; planId: string };
}

interface AuthState {
  currentUser: Usuario | null;
  isLoading: boolean;
  isRestoring: boolean; // true mientras verifica el token guardado
  error: string | null;
  login: (correo: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  cambiarPassword: (nuevaPassword: string) => Promise<boolean>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true); // Arranca restaurando
  const [error, setError] = useState<string | null>(null);

  // ── Al iniciar la app, verificar si hay un token guardado ──
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const token = await tokenStorage.get();
      if (!token) {
        setIsRestoring(false);
        return;
      }

      // Verificar que el token sigue siendo válido
      const response = await api.get('/auth/me');
      setCurrentUser(response.data);
    } catch (error) {
      // Token inválido o expirado — limpiar
      await tokenStorage.remove();
    } finally {
      setIsRestoring(false);
    }
  };

  // ── Login ──
  const login = useCallback(async (correo: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { correo, password });
      const { token, user } = response.data;

      // Guardar token para peticiones futuras
      await tokenStorage.save(token);
      setCurrentUser(user);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error de conexión con el servidor';
      setError(msg);
      setIsLoading(false);
      return false;
    }
  }, []);

  // ── Cambiar contraseña (primer ingreso obligatorio) ──
  const cambiarPassword = useCallback(async (nuevaPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/cambiar-password', { nuevaPassword });
      const { token, user } = response.data;

      // Guardar nuevo token (ya no debeCambiarPass)
      await tokenStorage.save(token);
      setCurrentUser(user);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al cambiar contraseña';
      setError(msg);
      setIsLoading(false);
      return false;
    }
  }, []);

  // ── Logout ──
  const logout = useCallback(async () => {
    await tokenStorage.remove();
    setCurrentUser(null);
    setError(null);
  }, []);

  // ── Refrescar datos del usuario ──
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setCurrentUser(response.data);
    } catch (error) {
      // Si falla, no hacer nada (el interceptor manejará 401)
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{
      currentUser, isLoading, isRestoring, error,
      login, logout, cambiarPassword, clearError, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);