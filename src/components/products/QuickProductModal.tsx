import { Package } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../hooks/useApp";
import type { Product } from "../../types/products";
import { money } from "../../utils/formatters";
import { Button } from "../ui/Button";
import { ErrorBox } from "../ui/ErrorMessage";
import { Modal } from "../ui/Modal";
import { QuantitySelector } from "./QuantitySelector";
export function QuickProductModal({ product: p }: { product: Product }) {
  const { setOverlay, add } = useApp();
  const nav = useNavigate();
  const [qty, setQty] = useState(1),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal title="Vista rápida" onClose={() => setOverlay(null)} busy={busy}>
      <div className="quick">
        <div className="product-placeholder">
          <Package size={100} strokeWidth={0.7} />
        </div>
        <div>
          <span className="eyebrow">{p.categoria?.nombre}</span>
          <h2>{p.nombre}</h2>
          <p className="muted">{p.descripcion}</p>
          <h2>{money(p.precioVenta)}</h2>
          <p className="stock">{p.inventario?.stock ?? 0} disponibles</p>
          <QuantitySelector
            value={qty}
            max={p.inventario?.stock}
            onChange={setQty}
          />
          {error && <ErrorBox error={error} />}
          <Button
            className="full"
            busy={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await add(p, qty);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            Agregar al carrito
          </Button>
          <button
            className="link"
            onClick={() => {
              setOverlay(null);
              nav(`/producto/${p.id}`);
            }}
          >
            Ver detalle completo →
          </button>
        </div>
      </div>
    </Modal>
  );
}
