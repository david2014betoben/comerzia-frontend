import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types/auth";
export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: Role[];
}) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user)
    return (
      <Navigate to="/acceso" state={{ volver: location.pathname }} replace />
    );
  if (allowedRoles && !allowedRoles.includes(user.rol))
    return <Navigate to="/403" replace />;
  return <>{children}</>;
}
export function RequireClient({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={["CLIENTE"]}>{children}</ProtectedRoute>;
}
