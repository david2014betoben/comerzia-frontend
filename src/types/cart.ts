import type { Product } from "./products";
export type Line = {
  id?: number;
  productoId?: number;
  producto: Product;
  cantidad: number;
  precioUnitario?: string | number;
  subtotal?: string | number;
};
export type Cart = { id: number; detalles: Line[] };

export type AddItemInput = { productoId: number; cantidad: number };
