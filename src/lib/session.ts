import type { User } from "../types/users";
export function readUser(): User | null {
  try {
    return JSON.parse(
      sessionStorage.getItem("comerzia.user") || "null",
    ) as User | null;
  } catch {
    return null;
  }
}
export function saveSession(token: string, user: User): void {
  sessionStorage.setItem("comerzia.token", token);
  sessionStorage.setItem("comerzia.user", JSON.stringify(user));
}
export function clearSession(): void {
  sessionStorage.removeItem("comerzia.token");
  sessionStorage.removeItem("comerzia.user");
}

export function readToken(): string | null {
  return sessionStorage.getItem("comerzia.token");
}
