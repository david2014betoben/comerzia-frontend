import type { Category } from "./categories";
export type CatalogRecord = {
  id: number;
  nombre: string;
  descripcion?: string;
  activa?: boolean;
  activo?: boolean;
  sku?: string;
  precioVenta?: number | string;
  costoCompra?: number | string;
  categoriaId?: number;
  categoria?: Category;
  inventario?: { stock: number };
};
