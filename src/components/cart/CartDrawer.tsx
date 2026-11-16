import { ArrowRight, Package, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../hooks/useApp";
import { cartService } from "../../services/cart.service";
import { money, total } from "../../utils/formatters";
import { QuantitySelector } from "../products/QuantitySelector";
import { Button } from "../ui/Button";
import { Empty } from "../ui/EmptyState";
import { Modal } from "../ui/Modal";
export function CartDrawer() {
  const { cart, setOverlay, refreshCart, toast } = useApp();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const lines = cart?.detalles || [];
  const change = async (id: number, q: number) => {
    setBusy(true);
    try {
      await cartService.setQuantity(id, q);
      await refreshCart();
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title={`Tu carrito · ${lines.reduce((s, l) => s + l.cantidad, 0)}`}
      drawer
      onClose={() => setOverlay(null)}
      busy={busy}
    >
      {!lines.length ? (
        <Empty title="Tu próxima compra te espera">
          <Button
            onClick={() => {
              setOverlay(null);
              nav("/");
            }}
          >
            Explorar productos
          </Button>
        </Empty>
      ) : (
        <>
          <div className="cart-list">
            {lines.map((l) => (
              <div className="line" key={l.producto.id}>
                <div className="mini-art">
                  <Package />
                </div>
                <div className="grow">
                  <strong>{l.producto.nombre}</strong>
                  <small>{money(l.producto.precioVenta)}</small>
                  <QuantitySelector
                    disabled={busy}
                    value={l.cantidad}
                    max={l.producto.inventario?.stock}
                    onChange={(q) => change(l.producto.id, q)}
                  />
                </div>
                <div>
                  <b>{money(Number(l.producto.precioVenta) * l.cantidad)}</b>
                  <button
                    className="icon"
                    disabled={busy}
                    aria-label={`Quitar ${l.producto.nombre}`}
                    onClick={() => change(l.producto.id, 0)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="drawer-bottom">
            <div className="between">
              <span>Total</span>
              <h2>{money(total(lines))}</h2>
            </div>
            <Button
              disabled={busy}
              className="full"
              onClick={() => {
                setOverlay(null);
                nav("/checkout");
              }}
            >
              Continuar compra
              <ArrowRight size={18} />
            </Button>
            <button className="link full" onClick={() => setOverlay(null)}>
              Seguir explorando
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
