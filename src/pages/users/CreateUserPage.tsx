import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ErrorBox } from "../../components/ui/ErrorMessage";
import { Modal } from "../../components/ui/Modal";
import { useApp } from "../../hooks/useApp";
import { usersService } from "../../services/users.service";
import { formText } from "../../utils/forms";

export function CreateUserPage() {
  const { user, toast } = useApp();
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  if (user?.rol !== "ADMIN") return <Navigate to="/403" replace />;
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">ACCESOS AL SISTEMA</span>
          <h1>Crear personal</h1>
          <p className="muted">Una cuenta para cada integrante de tu equipo.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <UserPlus size={18} />
          Nueva cuenta
        </Button>
      </div>
      <div className="surface staff-explain">
        <UserPlus size={42} />
        <h2>Tu equipo, conectado.</h2>
        <p className="muted">
          ADMIN administra catálogo y operaciones.
          <br />
          CAJERO opera ventas, consulta su caja y gestiona pedidos.
        </p>
      </div>
      {open && (
        <Modal
          title="Crear cuenta de personal"
          busy={busy}
          onClose={() => setOpen(false)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const f = new FormData(e.currentTarget);
              try {
                await usersService.createStaff({
                  nombre: formText(f, "nombre"),
                  email: formText(f, "email"),
                  password: formText(f, "password"),
                  rol: formText(f, "rol") as "ADMIN" | "CAJERO",
                });
                setOpen(false);
                toast("Cuenta de personal creada");
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Nombre
              <input name="nombre" required maxLength={100} />
            </label>
            <label>
              Correo
              <input name="email" type="email" required />
            </label>
            <label>
              Contraseña
              <input
                name="password"
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
              />
            </label>
            <label>
              Rol
              <select name="rol">
                <option>CAJERO</option>
                <option>ADMIN</option>
              </select>
            </label>
            {error && <ErrorBox error={error} />}
            <Button busy={busy} className="full">
              Crear cuenta
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
