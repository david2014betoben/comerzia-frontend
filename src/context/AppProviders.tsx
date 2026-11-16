import type { ReactNode } from "react";
import { AppProvider } from "./AppProvider";
import { AuthProvider } from "./AuthProvider";
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>{children}</AppProvider>
    </AuthProvider>
  );
}
