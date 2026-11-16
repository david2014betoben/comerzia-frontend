import { api } from "../lib/api";
import type { PaymentResult } from "../types/payments";
export const paymentsService = {
  simulate: (orderId: number, cardNumber: string) =>
    api<PaymentResult>(`/orders/${orderId}/payments/simulate`, "POST", {
      numeroTarjeta: cardNumber,
    }),
};
