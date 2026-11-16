import { useState } from "react";
import { useApp } from "../../hooks/useApp";
import { Modal } from "../ui/Modal";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
export function AuthModal({
  register = false,
  login,
}: {
  register?: boolean;
  login: (email: string, password: string) => Promise<void>;
}) {
  const { setOverlay, toast } = useApp();
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      title={register ? "Crea tu cuenta" : "Bienvenido de nuevo"}
      onClose={() => setOverlay(null)}
      busy={busy}
    >
      <div className="auth-mark">
        <img src="/brand.svg" alt="" />
        <span>COMERZIA</span>
      </div>
      <p className="muted">
        {register
          ? "Tu próxima compra empieza aquí."
          : "Inicia sesión para continuar tu compra."}
      </p>
      {register ? (
        <RegisterForm
          onBusyChange={setBusy}
          onRegistered={() => {
            toast("Cuenta creada. Ya puedes iniciar sesión.");
            setOverlay({ type: "auth" });
          }}
        />
      ) : (
        <LoginForm
          onBusyChange={setBusy}
          onLogin={({ email, password }) => login(email, password)}
        />
      )}
      <p className="auth-switch">
        {register ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"}{" "}
        <button
          className="link"
          disabled={busy}
          onClick={() => setOverlay({ type: "auth", register: !register })}
        >
          {register ? "Iniciar sesión" : "Crear cuenta"}
        </button>
      </p>
    </Modal>
  );
}
