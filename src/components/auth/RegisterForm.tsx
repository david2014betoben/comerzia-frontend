import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { usersService } from "../../services/users.service";
import { formText } from "../../utils/forms";
import { Button } from "../ui/Button";
import { ErrorBox } from "../ui/ErrorMessage";
import { PasswordField } from "./PasswordField";
export function RegisterForm({
  onRegistered,
  onBusyChange,
}: {
  onRegistered: () => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setError("");
        if (formText(f, "password") !== formText(f, "confirm")) {
          setError("Las contraseñas no coinciden");
          return;
        }
        setBusy(true);
        onBusyChange(true);
        try {
          await usersService.register({
            nombre: formText(f, "nombre"),
            email: formText(f, "email"),
            password: formText(f, "password"),
            ...(formText(f, "telefono")
              ? { telefono: formText(f, "telefono") }
              : {}),
          });
          onRegistered();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
          onBusyChange(false);
        }
      }}
    >
      <label>
        Nombre completo
        <input
          name="nombre"
          minLength={2}
          maxLength={100}
          required
          autoComplete="name"
        />
      </label>
      <label>
        Correo electrónico
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Teléfono <small>opcional</small>
        <input name="telefono" maxLength={20} autoComplete="tel" />
      </label>
      <PasswordField register />
      <PasswordField name="confirm" label="Confirmar contraseña" register />
      {error && <ErrorBox error={error} />}
      <Button busy={busy} className="full">
        Crear cuenta
        <ArrowRight size={18} />
      </Button>
    </form>
  );
}
