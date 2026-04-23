//app_movil/src/types/sucursales/types.ts

export interface Sucursal {
  id: string;
  nombre: string;
  detalles?: string;
  direccion?: string;
  estado: string;
  horarios?: string;
  maxAdministradores: number;
  _count?: { usuarios: number; prendas: number };
}