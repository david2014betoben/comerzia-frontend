import { ArrowRight } from "lucide-react";
import { useState } from "react";
import type { LoginCredentials } from "../../types/auth";
import { formText } from "../../utils/forms";
import { Button } from "../ui/Button";
import { ErrorBox } from "../ui/ErrorMessage";
import { PasswordField } from "./PasswordField";
export function LoginForm({
  onLogin,
  onBusyChange,
}: {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onBusyChange: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        onBusyChange(true);
        setError("");
        try {
          await onLogin({
            email: formText(f, "email"),
            password: formText(f, "password"),
          });
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
          onBusyChange(false);
        }
      }}
    >
      <label>
        Correo electrónico
        <input type="email" name="email" required autoComplete="email" />
      </label>
      <PasswordField />
      {error && <ErrorBox error={error} />}
      <Button busy={busy} className="full">
        Iniciar sesión
        <ArrowRight size={18} />
      </Button>
    </form>
  );
}
