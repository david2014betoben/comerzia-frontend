import { api } from "../lib/api";
import type { AddItemInput } from "../types/cart";
import type { Sale } from "../types/sales";
export const posService = {
  getById: (id: number) => api<Sale>(`/pos/sales/${id}`),
  open: (sessionId: number) =>
    api<Sale>("/pos/sales", "POST", { sesionCajaId: sessionId }),
  addItem: (id: number, data: AddItemInput) =>
    api<Sale>(`/pos/sales/${id}/items`, "POST", data),
  setQuantity: (id: number, productId: number, quantity: number) =>
    api<Sale>(`/pos/sales/${id}/items/${productId}`, "PATCH", {
      cantidad: quantity,
    }),
  pay: (id: number, method: string) =>
    api<Sale>(`/pos/sales/${id}/pay`, "POST", { metodoPago: method }),
  getByDate: (day: string) =>
    api<Sale[]>(`/pos/sales?fecha=${encodeURIComponent(day)}`),
};
