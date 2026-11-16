import type { Line } from "./cart";
export type Sale = {
  id: number;
  numeroComprobante: string;
  estado: string;
  metodoPago?: string;
  total: string | number;
  createdAt: string;
  sesionCajaId: number;
  detalles: Line[];
};
