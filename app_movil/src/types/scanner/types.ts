//app_movil/src/types/scanner/types.ts

export type TipoCodigo = 'BARRAS' | 'QR' | 'MANUAL';
export type MetodoPago = 'EFECTIVO' | 'QR' | 'TARJETA';

export interface Prenda {
  id: string;
  marca?: string;
  tipo: string;
  codigo: string;
  tipoCodigo: string;
  detalles?: string;
  foto?: string;
  precio: number;
  rebaja?: number;
  sucursalId: string;
  estadoVenta: string;
  sucursal?: { nombre: string };
}

export interface PaymentMethod {
  metodo: MetodoPago;
  monto: number;
}