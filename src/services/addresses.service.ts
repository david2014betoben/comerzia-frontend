import { api } from "../lib/api";
import type { Address, AddressInput } from "../types/addresses";
export const addressesService = {
  getAll: () => api<Address[]>("/addresses"),
  create: (data: AddressInput) => api<Address>("/addresses", "POST", data),
};
