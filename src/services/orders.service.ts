import { api } from "../lib/api";
import type { CheckoutResult, Order, SocialOrderInput } from "../types/orders";
export const ordersService = {
  getMine: () => api<Order[]>("/orders/my"),
  getQueue: () => api<Order[]>("/orders/queue"),
  checkout: (addressId: number) =>
    api<CheckoutResult>("/orders/checkout", "POST", { direccionId: addressId }),
  updateStatus: (id: number, status: string) =>
    api<Order>(`/orders/${id}/status`, "PATCH", { estado: status }),
  createSocial: (data: SocialOrderInput) =>
    api<Order>("/orders/social", "POST", data),
};
