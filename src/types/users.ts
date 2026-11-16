import type { Role } from "./auth";
export type User = { id: number; nombre: string; email: string; rol: Role };
export type RegisterInput = {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
};
export type CreateUserInput = RegisterInput & { rol: "ADMIN" | "CAJERO" };
