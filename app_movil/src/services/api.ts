// app_movil/src/services/api.ts  (REEMPLAZA el existente)

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15 segundos timeout
});

// ── Interceptor: agrega el token JWT a cada petición automáticamente ──
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // Si falla leer el token, continúa sin él
  }
  return config;
});

// ── Interceptor: si el servidor responde 401, limpia el token ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth-token');
      // El AuthContext detectará que no hay token y redirigirá al login
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Helpers para manejar el token ──
export const tokenStorage = {
  async save(token: string) {
    await AsyncStorage.setItem('auth-token', token);
  },
  async get(): Promise<string | null> {
    return AsyncStorage.getItem('auth-token');
  },
  async remove() {
    await AsyncStorage.removeItem('auth-token');
  },
};