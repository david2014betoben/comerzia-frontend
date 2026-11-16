import { api } from "../lib/api";
import type { AddItemInput, Cart } from "../types/cart";
export const cartService = {
  getActive: () => api<Cart | null>("/carts/me"),
  addItem: (data: AddItemInput) => api<Cart>("/carts/items", "POST", data),
  setQuantity: (productId: number, quantity: number) =>
    api<Cart>(`/carts/items/${productId}`, "PATCH", { cantidad: quantity }),
};
