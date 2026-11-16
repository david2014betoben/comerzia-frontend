import { api } from "../lib/api";
import type { LoginCredentials, LoginResponse } from "../types/auth";
export const authService = {
  login: (credentials: LoginCredentials) =>
    api<LoginResponse>("/auth/login", "POST", credentials),
};
