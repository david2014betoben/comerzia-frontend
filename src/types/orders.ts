import type { Line } from "./cart";
import type { Payment } from "./payments";
export type Order = {
  id: number;
  estado: string;
  origen: string;
  createdAt: string;
  totalProductos: string | number;
  destinatario: string;
  telefonoDestino: string;
  ciudadDestino: string;
  direccionDestino: string;
  referencias?: string;
  detalles: Line[];
  pagos?: Payment[];
};

export type CheckoutResult = {
  pedidoId: number;
  pagoId: number;
  totalProductos: string;
  simulacion: boolean;
};
export type SocialOrderInput = {
  destinatario: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  referencias?: string;
  metodoPago: string;
  productos: { productoId: number; cantidad: number }[];
};
