//app_movil/src/types/inicio/types.ts

export type Periodo = 'dia' | 'semana' | 'mes' | 'ano';

export interface ChartData {
  label: string;
  ventas: number;
  ingresos: number;
}