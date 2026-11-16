import type { Category } from "./categories";
export type Product = {
  id: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  precioVenta: string | number;
  costoCompra?: string | number;
  activo?: boolean;
  categoriaId?: number;
  categoria?: Category;
  inventario?: { stock: number };
};

export type ProductInput = {
  sku: string;
  nombre: string;
  descripcion?: string;
  categoriaId: number;
  costoCompra: number;
  precioVenta: number;
  stock: number;
};
