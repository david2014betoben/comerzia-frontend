import { ArrowRight, MapPin, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AddressCard } from "../../components/addresses/AddressCard";
import { AddressForm } from "../../components/addresses/AddressForm";
import { LineItems } from "../../components/products/LineItems";
import { Button } from "../../components/ui/Button";
import { Empty } from "../../components/ui/EmptyState";
import { ErrorBox } from "../../components/ui/ErrorMessage";
import { Loading } from "../../components/ui/LoadingState";
import { useApi } from "../../hooks/useApi";
import { useApp } from "../../hooks/useApp";
import { addressesService } from "../../services/addresses.service";
import { ordersService } from "../../services/orders.service";
import { money, total } from "../../utils/formatters";

export function CheckoutPage() {
  const { cart, refreshCart } = useApp();
  const r = useApi(() => addressesService.getAll());
  const [selected, setSelected] = useState(0),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [uncertain, setUncertain] = useState(false);
  const nav = useNavigate();
  const current =
    selected || r.data?.find((a) => a.esPrincipal)?.id || r.data?.[0]?.id;
  const lines = cart?.detalles || [];
  return (
    <main className="page store-page">
      <Link className="back" to="/">
        ← Volver a la tienda
      </Link>
      <span className="eyebrow">TU COMPRA, PASO A PASO</span>
      <h1>Completa tu compra</h1>
      <div className="steps">
        <b>01 Dirección</b>
        <span>—</span>
        <b>02 Revisión</b>
        <span>—</span>
        <span>03 Pago</span>
      </div>
      {!lines.length ? (
        <Empty title="Tu carrito está vacío">
          <Link className="btn" to="/">
            Explorar productos
          </Link>
        </Empty>
      ) : (
        <div className="checkout-grid">
          <div>
            <section className="surface">
              <div className="between">
                <h2>
                  <MapPin size={22} />
                  Dirección de entrega
                </h2>
                <button className="link" onClick={() => setOpen(true)}>
                  <Plus size={16} />
                  Agregar
                </button>
              </div>
              {r.loading ? (
                <Loading />
              ) : r.error ? (
                <ErrorBox error={r.error} retry={r.reload} />
              ) : !r.data?.length ? (
                <Empty title="Agrega tu primera dirección">
                  <Button onClick={() => setOpen(true)}>
                    Agregar dirección
                  </Button>
                </Empty>
              ) : (
                <div className="address-grid">
                  {r.data.map((a) => (
                    <AddressCard
                      key={a.id}
                      a={a}
                      selected={current === a.id}
                      onSelect={() => setSelected(a.id)}
                    />
                  ))}
                </div>
              )}
            </section>
            <section className="surface">
              <h2>Revisión de productos</h2>
              <LineItems lines={lines} />
            </section>
          </div>
          <aside className="surface order-summary">
            <span className="eyebrow">UN PASO MÁS CERCA</span>
            <h2>Resumen de compra</h2>
            <div className="summary-row">
              <span>Productos</span>
              <b>{lines.reduce((s, l) => s + l.cantidad, 0)}</b>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>{money(total(lines))}</strong>
            </div>
            <div className="alert">
              <ShieldCheck size={20} />
              <span>Pago de prueba. No se realizarán cobros reales.</span>
            </div>
            {error && <ErrorBox error={error} />}
            {uncertain ? (
              <Link className="btn full" to="/pedidos">
                Consultar mis pedidos
              </Link>
            ) : (
              <Button
                className="full"
                disabled={!current}
                busy={busy}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    const order = await ordersService.checkout(current!);
                    await refreshCart().catch(() => {});
                    nav(`/pago/${order.pedidoId}`);
                  } catch (e) {
                    setError((e as Error).message);
                    if ((e as { status?: number }).status === 0)
                      setUncertain(true);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Continuar al pago de prueba
                <ArrowRight size={18} />
              </Button>
            )}
            <p className="fine-print">
              Al continuar se reservarán las unidades mientras tu pedido espera
              el resultado del pago.
            </p>
          </aside>
        </div>
      )}
      {open && (
        <AddressForm
          onClose={() => setOpen(false)}
          onSaved={(a) => {
            setSelected(a.id);
            setOpen(false);
            r.reload();
          }}
        />
      )}
    </main>
  );
}
