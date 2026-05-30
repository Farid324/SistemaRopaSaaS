// app_movil/src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

import api, { tokenStorage } from '../services/api';

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
  isRestoring: boolean;
  error: string | null;
  profilePhoto: string | null;
  photoUploading: boolean;
  login: (correo: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  cambiarPassword: (nuevaPassword: string) => Promise<boolean>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  setProfilePhoto: (uri: string | null, base64?: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profilePhoto, setProfilePhotoState] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => { restoreSession(); }, []);

  const restoreSession = async () => {
    try {
      const token = await tokenStorage.get();
      if (!token) { setIsRestoring(false); return; }
      const response = await api.get('/auth/me');
      setCurrentUser(response.data);
      // Si hay foto en el backend, usarla
      if (response.data.fotoPerfil) {
        setProfilePhotoState(response.data.fotoPerfil);
      }
    } catch {
      await tokenStorage.remove();
    } finally {
      setIsRestoring(false);
    }
  };

  // ═══════════════════ PUNTO 1: Foto de perfil persistente ═══════════════════
  const setProfilePhoto = useCallback(async (uri: string | null, providedBase64?: string | null) => {
    setPhotoUploading(true);

    try {
      let base64Data: string | null = null;

      if (uri) {
        if (!providedBase64) {
          throw new Error("Base64 string is required for profile photo");
        }
        // Detectar tipo de imagen
        const extension = uri.split('.').pop()?.toLowerCase() || 'jpeg';
        const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
        base64Data = `data:${mimeType};base64,${providedBase64}`;
      }

      // Enviar al backend — NO actualizamos la foto local hasta que el servidor confirme
      await api.post('/auth/actualizar-foto', { fotoPerfil: base64Data });

      // Solo si el servidor responde OK, mostramos la foto
      setProfilePhotoState(uri);
    } catch (error) {
      console.log('Error subiendo foto de perfil:', error);
      // NO actualizamos profilePhotoState — la foto no se muestra
      throw error;
    } finally {
      setPhotoUploading(false);
    }
  }, []);

  const login = useCallback(async (correo: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { correo, password });
      const { token, user } = response.data;
      await tokenStorage.save(token);
      setCurrentUser(user);
      if (user.fotoPerfil) setProfilePhotoState(user.fotoPerfil);
      else setProfilePhotoState(null);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de conexión');
      setIsLoading(false);
      return false;
    }
  }, []);

  const cambiarPassword = useCallback(async (nuevaPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/cambiar-password', { nuevaPassword });
      const { token, user } = response.data;
      await tokenStorage.save(token);
      setCurrentUser(user);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar contraseña');
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await tokenStorage.remove();
    setCurrentUser(null);
    setProfilePhotoState(null);
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setCurrentUser(response.data);
      if (response.data.fotoPerfil) setProfilePhotoState(response.data.fotoPerfil);
    } catch {}
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{
      currentUser, isLoading, isRestoring, error, profilePhoto, photoUploading,
      login, logout, cambiarPassword, clearError, refreshUser, setProfilePhoto,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);