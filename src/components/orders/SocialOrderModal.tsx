import { CheckCircle2, Plus } from "lucide-react";
import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { useApp } from "../../hooks/useApp";
import { ordersService } from "../../services/orders.service";
import { productsService } from "../../services/products.service";
import type { Line } from "../../types/cart";
import type { SocialOrderInput } from "../../types/orders";
import type { Product } from "../../types/products";
import { label, money, total } from "../../utils/formatters";
import { formText } from "../../utils/forms";
import { LineItems } from "../products/LineItems";
import { QuantitySelector } from "../products/QuantitySelector";
import { Button } from "../ui/Button";
import { ErrorBox } from "../ui/ErrorMessage";
import { Loading } from "../ui/LoadingState";
import { Modal } from "../ui/Modal";

export function SocialOrderModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const r = useApi(() => productsService.getForStaff());
  const [lines, setLines] = useState<Line[]>([]),
    [query, setQuery] = useState(""),
    [review, setReview] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [uncertain, setUncertain] = useState(false);
  const [delivery, setDelivery] = useState<
    Omit<SocialOrderInput, "metodoPago" | "productos">
  >({ destinatario: "", telefono: "", ciudad: "", direccion: "" });
  const [method, setMethod] = useState("EFECTIVO");
  const { toast } = useApp();
  const add = (p: Product) => {
    const old = lines.find((l) => l.producto.id === p.id);
    const qty = (old?.cantidad || 0) + 1;
    if (qty > (p.inventario?.stock || 0)) return;
    setLines(
      old
        ? lines.map((l) =>
            l.producto.id === p.id ? { ...l, cantidad: qty } : l,
          )
        : [...lines, { producto: p, cantidad: 1 }],
    );
  };
  return (
    <Modal title="Nuevo pedido de redes" onClose={onClose} busy={busy}>
      {uncertain ? (
        <div className="result">
          <h2>No pudimos confirmar el registro</h2>
          <p>Consulta la cola antes de registrar nuevamente.</p>
          <Button onClick={onSaved}>Consultar pedidos</Button>
        </div>
      ) : review ? (
        <>
          <h3>{delivery.destinatario}</h3>
          <p>
            {delivery.direccion} · {delivery.ciudad}
            <br />
            {delivery.telefono}
          </p>
          <LineItems lines={lines} />
          <div className="summary-total">
            <span>Total · {label(method)}</span>
            <strong>{money(total(lines))}</strong>
          </div>
          <div className="alert">
            Al confirmar quedará PAGADO y se descontará el stock. El cobro debe
            estar confirmado.
          </div>
          {error && <ErrorBox error={error} />}
          <div className="form-actions">
            <Button
              className="secondary"
              disabled={busy}
              onClick={() => setReview(false)}
            >
              Volver a editar
            </Button>
            <Button
              busy={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const order = await ordersService.createSocial({
                    ...delivery,
                    metodoPago: method,
                    productos: lines.map((l) => ({
                      productoId: l.producto.id,
                      cantidad: l.cantidad,
                    })),
                  });
                  toast(`Pedido #${order.id} registrado como pagado`);
                  onSaved();
                } catch (e) {
                  setError((e as Error).message);
                  if ((e as { status?: number }).status === 0)
                    setUncertain(true);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Confirmar pedido pagado
            </Button>
          </div>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setDelivery({
              destinatario: formText(f, "destinatario"),
              telefono: formText(f, "telefono"),
              ciudad: formText(f, "ciudad"),
              direccion: formText(f, "direccion"),
              referencias: formText(f, "referencias"),
            });
            setReview(true);
          }}
        >
          <h3>01 · Datos de entrega</h3>
          <div className="form-grid">
            {[
              ["destinatario", "Destinatario", 100],
              ["telefono", "Teléfono", 30],
              ["ciudad", "Ciudad", 80],
              ["direccion", "Dirección", 200],
              ["referencias", "Referencias (opcional)", 500],
            ].map(([k, t, max]) => (
              <label key={k}>
                {t}
                <input
                  name={String(k)}
                  defaultValue={delivery[k as keyof typeof delivery]}
                  required={k !== "referencias"}
                  maxLength={Number(max)}
                />
              </label>
            ))}
          </div>
          <h3>02 · Productos</h3>
          <input
            aria-label="Buscar productos"
            value={query}
            placeholder="Buscar producto…"
            onChange={(e) => setQuery(e.target.value)}
          />
          {r.loading ? (
            <Loading />
          ) : r.error ? (
            <ErrorBox error={r.error} retry={r.reload} />
          ) : (
            <div className="picker">
              {r.data
                ?.filter(
                  (p) =>
                    p.activo &&
                    (p.inventario?.stock || 0) > 0 &&
                    p.nombre.toLowerCase().includes(query.toLowerCase()),
                )
                .map((p) => (
                  <button type="button" key={p.id} onClick={() => add(p)}>
                    <span>
                      {p.nombre}
                      <small>{p.inventario?.stock} disponibles</small>
                    </span>
                    <b>{money(p.precioVenta)}</b>
                    <Plus size={17} />
                  </button>
                ))}
            </div>
          )}
          {lines.map((l) => (
            <div className="line" key={l.producto.id}>
              <strong className="grow">{l.producto.nombre}</strong>
              <QuantitySelector
                value={l.cantidad}
                max={l.producto.inventario?.stock}
                onChange={(q) =>
                  setLines(
                    lines.map((x) =>
                      x.producto.id === l.producto.id
                        ? { ...x, cantidad: q }
                        : x,
                    ),
                  )
                }
              />
              <button
                type="button"
                className="icon"
                aria-label={`Quitar ${l.producto.nombre}`}
                onClick={() =>
                  setLines(lines.filter((x) => x.producto.id !== l.producto.id))
                }
              >
                ×
              </button>
            </div>
          ))}
          <h3>03 · Pago confirmado manualmente</h3>
          <select
            aria-label="Método de pago"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {["EFECTIVO", "TARJETA", "TRANSFERENCIA", "QR"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <div className="summary-total">
            <span>Total</span>
            <strong>{money(total(lines))}</strong>
          </div>
          <Button disabled={!lines.length} className="full">
            Revisar pedido
            <CheckCircle2 size={18} />
          </Button>
        </form>
      )}
    </Modal>
  );
}
