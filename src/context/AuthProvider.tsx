import { useEffect, useState, type ReactNode } from "react";
import { clearSession, readUser, saveSession } from "../lib/session";
import { authService } from "../services/auth.service";
import type { LoginCredentials } from "../types/auth";
import { AuthContext } from "./AuthContext";
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(readUser);
  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    saveSession(response.access_token, response.usuario);
    setUser(response.usuario);
    return response.usuario;
  };
  const logout = () => {
    clearSession();
    setUser(null);
  };
  useEffect(() => {
    window.addEventListener("comerzia:expired", logout);
    return () => window.removeEventListener("comerzia:expired", logout);
  }, []);
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
