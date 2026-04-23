//app_movil/src/types/inventario/types.ts

export type TipoCodigo = 'BARRAS' | 'QR' | 'MANUAL';
export type EstadoPrenda = 'NUEVO' | 'SEMI_NUEVO' | 'USADO';
export type EstadoVenta = 'DISPONIBLE' | 'VENDIDO' | 'RESERVADO';

export interface Prenda {
  id: string;
  marca?: string;
  tipo: string;
  codigo: string;
  tipoCodigo: TipoCodigo;
  detalles?: string;
  estado: EstadoPrenda;
  foto?: string;
  precio: number;
  rebaja?: number;
  sucursalId: string;
  estadoVenta: EstadoVenta;
  publicadoWeb: boolean;
  sucursal?: { nombre: string };
}

export interface Sucursal {
  id: string;
  nombre: string;
}