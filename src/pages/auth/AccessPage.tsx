import { ArrowRight, ShieldAlert } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useApp } from "../../hooks/useApp";

export function AccessPage() {
  const location = useLocation();
  const back = location.state?.volver;
  const { user, setOverlay } = useApp();
  if (user)
    return (
      <Navigate
        to={
          user.rol === "CLIENTE"
            ? typeof back === "string" &&
              back.startsWith("/") &&
              !back.startsWith("//")
              ? back
              : "/"
            : "/panel"
        }
        replace
      />
    );
  return (
    <main className="page result">
      <ShieldAlert size={44} />
      <h1>Tu cuenta te espera.</h1>
      <p className="muted">Inicia sesión para continuar.</p>
      <Button onClick={() => setOverlay({ type: "auth" })}>
        Iniciar sesión
        <ArrowRight size={18} />
      </Button>
    </main>
  );
}
