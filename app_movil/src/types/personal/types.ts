//app_movil/src/types/personal/types.ts

export type Rol = 'OWNER_PRINCIPAL' | 'CO_OWNER' | 'ADMINISTRADOR' | 'EMPLEADO';
export type Estado = 'ACTIVO' | 'BLOQUEADO';

export interface Usuario {
  id: string;
  nombreCompleto: string;
  ci: string;
  correo: string;
  telefono: string;
  edad?: number;
  rol: Rol;
  estado: Estado;
  sucursalId?: string;
  permisoEditarPrendas?: boolean;
  sucursal?: { nombre: string };
}

export interface Sucursal {
  id: string;
  nombre: string;
}