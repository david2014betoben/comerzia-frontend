import { Navigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";

export function PanelRedirect() {
  const { user } = useApp();
  return <Navigate to={user?.rol === "ADMIN" ? "productos" : "pos"} replace />;
}
