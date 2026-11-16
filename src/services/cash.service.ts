import { api } from "../lib/api";
import type { Cash, CashClosing } from "../types/cash";
export const cashService = {
  getCurrent: () => api<Cash | null>("/cash/sessions/current"),
  open: (initialAmount: number) =>
    api<Cash>("/cash/sessions/open", "POST", { montoInicial: initialAmount }),
  close: (sessionId: number, countedAmount: number) =>
    api<CashClosing>(`/cash/sessions/${sessionId}/close`, "POST", {
      efectivoContado: countedAmount,
    }),
};
