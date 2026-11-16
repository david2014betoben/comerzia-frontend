import { api } from "../lib/api";
import type { Product, ProductInput } from "../types/products";
export const productsService = {
  getAll: () => api<Product[]>("/products"),
  getForStaff: () => api<Product[]>("/products/manage"),
  getById: (id: number) => api<Product>(`/products/${id}`),
  create: (data: ProductInput) => api<Product>("/products", "POST", data),
  update: (id: number, data: Partial<ProductInput>) =>
    api<Product>(`/products/${id}`, "PATCH", data),
  deactivate: (id: number) => api<Product>(`/products/${id}`, "DELETE"),
};
