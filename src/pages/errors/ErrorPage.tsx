import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../../hooks/useApp";

export function ErrorPage({ denied = false }: { denied?: boolean }) {
  const { user } = useApp();
  return (
    <main className="page result missing">
      <span className="error-number">{denied ? "403" : "404"}</span>
      <h1>
        {denied
          ? "Este espacio tiene otro acceso."
          : "Parece que tomaste otro camino."}
      </h1>
      <p className="muted">
        {denied
          ? "Tu cuenta no tiene permisos para esta sección."
          : "No encontramos la página que estás buscando."}
      </p>
      <Link
        className="btn"
        to={user && user.rol !== "CLIENTE" ? "/panel" : "/"}
      >
        {user && user.rol !== "CLIENTE"
          ? "Volver al panel"
          : "Volver a la tienda"}
        <ArrowRight size={18} />
      </Link>
    </main>
  );
}
