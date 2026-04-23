//app_movil/src/types/ventas/types.ts

export interface DetallePrenda {
  id: string;
  precioVendido: number;
  prenda: {
    id: string;
    codigo: string;
    marca?: string;
    tipo: string;
    foto?: string;
  };
}

export interface MetodoPagoItem {
  id: string;
  metodo: 'EFECTIVO' | 'QR' | 'TARJETA';
  monto: number;
}

export interface Venta {
  id: string;
  fecha: string;
  totalCobrado: number;
  vendedor: { nombreCompleto: string };
  sucursal: { nombre: string };
  detallesPrendas: DetallePrenda[];
  metodosDePago: MetodoPagoItem[];
}