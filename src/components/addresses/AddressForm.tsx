import { useState } from "react";
import { useApp } from "../../hooks/useApp";
import { addressesService } from "../../services/addresses.service";
import type { Address } from "../../types/addresses";
import { formText } from "../../utils/forms";
import { Button } from "../ui/Button";
import { ErrorBox } from "../ui/ErrorMessage";
import { Modal } from "../ui/Modal";

export function AddressForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (a: Address) => void;
}) {
  const { user } = useApp();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal title="Agregar dirección" onClose={onClose} busy={busy}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true);
          setError("");
          try {
            const a = await addressesService.create({
              alias: formText(f, "alias"),
              destinatario: formText(f, "destinatario"),
              telefono: formText(f, "telefono"),
              ciudad: formText(f, "ciudad"),
              direccion: formText(f, "direccion"),
              referencias: formText(f, "referencias") || undefined,
              esPrincipal: formText(f, "esPrincipal") === "on",
            });
            onSaved(a);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {[
          ["alias", "Alias", "Casa", 50],
          ["destinatario", "Destinatario", user?.nombre || "", 100],
          ["telefono", "Teléfono", "", 30],
          ["ciudad", "Ciudad", "", 80],
          ["direccion", "Dirección", "", 200],
          ["referencias", "Referencias (opcional)", "", 500],
        ].map(([name, title, placeholder, max]) => (
          <label key={name}>
            {title}
            <input
              name={String(name)}
              placeholder={String(placeholder)}
              required={name !== "referencias"}
              maxLength={Number(max)}
            />
          </label>
        ))}
        <label className="check-label">
          <input type="checkbox" name="esPrincipal" />
          Usar como dirección principal
        </label>
        {error && <ErrorBox error={error} />}
        <div className="form-actions">
          <Button
            type="button"
            className="secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button busy={busy}>Guardar dirección</Button>
        </div>
      </form>
    </Modal>
  );
}
