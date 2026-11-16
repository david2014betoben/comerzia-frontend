import type { User } from "./users";
export type Role = "ADMIN" | "CAJERO" | "CLIENTE";
export type LoginCredentials = { email: string; password: string };
export type LoginResponse = { access_token: string; usuario: User };
export type AuthContextValue = {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => void;
};
