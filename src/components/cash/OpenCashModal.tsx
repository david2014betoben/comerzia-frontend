import { useState } from "react";
import { useApp } from "../../hooks/useApp";
import { cashService } from "../../services/cash.service";
import { Button } from "../ui/Button";
import { ErrorBox } from "../ui/ErrorMessage";
import { Modal } from "../ui/Modal";

export function OpenCashModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useApp();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal title="Abrir caja" onClose={onClose} busy={busy}>
      <p className="muted">
        {user?.nombre} · Efectivo disponible al comenzar la sesión.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await cashService.open(
              Number(new FormData(e.currentTarget).get("montoInicial")),
            );
            onSaved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Monto inicial (USD)
          <input
            name="montoInicial"
            type="number"
            min="0"
            step="0.01"
            required
            autoFocus
          />
        </label>
        {error && <ErrorBox error={error} />}
        <Button busy={busy} className="full">
          Abrir caja
        </Button>
      </form>
    </Modal>
  );
}
