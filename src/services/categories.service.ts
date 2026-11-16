import { api } from "../lib/api";
import type { Category, CategoryInput } from "../types/categories";
export const categoriesService = {
  getAll: () => api<Category[]>("/categories"),
  getForStaff: () => api<Category[]>("/categories/manage"),
  create: (data: CategoryInput) => api<Category>("/categories", "POST", data),
  update: (id: number, data: Partial<CategoryInput>) =>
    api<Category>(`/categories/${id}`, "PATCH", data),
  deactivate: (id: number) => api<Category>(`/categories/${id}`, "DELETE"),
};
