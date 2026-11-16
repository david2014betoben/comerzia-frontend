import { Eye, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../hooks/useApp";
import type { Product } from "../../types/products";
import { money } from "../../utils/formatters";
import { Button } from "../ui/Button";
import { ProductImage } from "./ProductImage";

export function ProductCard({ p }: { p: Product }) {
  const { setOverlay, add, toast } = useApp();
  const [busy, setBusy] = useState(false);
  return (
    <article className="product-card">
      <div className="product-photo">
        <Link to={`/producto/${p.id}`} aria-label={`Ver ${p.nombre}`}>
          <ProductImage product={p} />
        </Link>
        <button
          className="quick-btn"
          onClick={() => setOverlay({ type: "product", product: p })}
        >
          <Eye size={16} />
          Vista rápida
        </button>
        <span className="photo-tag">{p.categoria?.nombre}</span>
      </div>
      <div className="product-meta">
        <small>{p.sku}</small>
        <Link to={`/producto/${p.id}`}>
          <h3>{p.nombre}</h3>
        </Link>
        <div className="between">
          <b>{money(p.precioVenta)}</b>
          <Button
            className="add-btn"
            busy={busy}
            aria-label={`Agregar ${p.nombre}`}
            onClick={async () => {
              setBusy(true);
              try {
                await add(p);
              } catch (e) {
                toast((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Plus size={19} />
          </Button>
        </div>
      </div>
    </article>
  );
}
