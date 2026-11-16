import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../hooks/useApp";
import { ordersService } from "../../services/orders.service";
import type { Order } from "../../types/orders";
import { date, label, money } from "../../utils/formatters";
import { LineItems } from "../products/LineItems";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ErrorBox } from "../ui/ErrorMessage";
import { Modal } from "../ui/Modal";

export function OrderDetailDrawer({
  o,
  onClose,
  staff = false,
  onChanged,
}: {
  o: Order;
  onClose: () => void;
  staff?: boolean;
  onChanged?: () => void;
}) {
  const [confirm, setConfirm] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const next =
    o.estado === "PAGADO"
      ? "EN_CAMINO"
      : o.estado === "EN_CAMINO"
        ? "ENTREGADO"
        : null;
  const { toast } = useApp();
  return (
    <Modal title={`Pedido #${o.id}`} drawer onClose={onClose} busy={busy}>
      <div className="between">
        <small>{date(o.createdAt)}</small>
        <Badge value={o.estado} />
      </div>
      {["PAGADO", "EN_CAMINO", "ENTREGADO"].includes(o.estado) && (
        <div className="progress">
          {["PAGADO", "EN_CAMINO", "ENTREGADO"].map((s, i) => (
            <div
              className={
                i <= ["PAGADO", "EN_CAMINO", "ENTREGADO"].indexOf(o.estado)
                  ? "done"
                  : ""
              }
              key={s}
            >
              <span>{i + 1}</span>
              {label(s)}
            </div>
          ))}
        </div>
      )}
      {o.estado === "PENDIENTE" && (
        <div className="alert">Esperando confirmación del pago.</div>
      )}
      {o.estado === "CANCELADO" && (
        <div className="alert danger">
          Pedido cancelado.
          {o.pagos?.some((p) => p.estado === "RECHAZADO") &&
            " El pago fue rechazado y el stock reservado fue liberado."}
        </div>
      )}
      <LineItems lines={o.detalles} />
      <div className="summary-total">
        <span>Total</span>
        <strong>{money(o.totalProductos)}</strong>
      </div>
      <section className="detail-section">
        <h3>Entrega</h3>
        <b>{o.destinatario}</b>
        <p>
          {o.direccionDestino}
          <br />
          {o.ciudadDestino}
          <br />
          {o.telefonoDestino}
        </p>
        {o.referencias && <p className="muted">{o.referencias}</p>}
      </section>
      {o.pagos?.map((p, i) => (
        <div className="summary-row" key={i}>
          <span>
            {p.metodo === "PASARELA" ? "Pago simulado" : label(p.metodo)}
          </span>
          <Badge value={p.estado} />
        </div>
      ))}
      {error && <ErrorBox error={error} />}
      {staff &&
        next &&
        (confirm ? (
          <div className="surface">
            <h3>¿Marcar {label(next).toLowerCase()}?</h3>
            <p>Se actualizará el pedido #{o.id}.</p>
            <div className="form-actions">
              <Button
                className="secondary"
                disabled={busy}
                onClick={() => setConfirm(false)}
              >
                Volver
              </Button>
              <Button
                busy={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await ordersService.updateStatus(o.id, next);
                    toast(
                      next === "ENTREGADO"
                        ? "Pedido entregado y retirado de la cola."
                        : "Pedido marcado en camino.",
                    );
                    onChanged?.();
                    onClose();
                  } catch (e) {
                    setError((e as Error).message);
                    onChanged?.();
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        ) : (
          <Button className="full" onClick={() => setConfirm(true)}>
            Marcar {label(next).toLowerCase()}
            <ArrowRight size={17} />
          </Button>
        ))}
      {!staff && o.estado === "PENDIENTE" && (
        <Link className="btn full" to={`/pago/${o.id}`}>
          Continuar pago de prueba
        </Link>
      )}
    </Modal>
  );
}
