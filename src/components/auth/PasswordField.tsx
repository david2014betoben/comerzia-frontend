import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
export function PasswordField({
  name = "password",
  label = "Contraseña",
  register = false,
}: {
  name?: string;
  label?: string;
  register?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <label>
      {label}
      <div className="password">
        <input
          type={show ? "text" : "password"}
          name={name}
          required
          minLength={register ? 8 : 1}
          autoComplete={register ? "new-password" : "current-password"}
        />
        <button
          type="button"
          className="icon"
          onClick={() => setShow(!show)}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}
