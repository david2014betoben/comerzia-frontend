import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProductImage } from "../../components/products/ProductImage";
import { QuantitySelector } from "../../components/products/QuantitySelector";
import { Button } from "../../components/ui/Button";
import { ErrorBox } from "../../components/ui/ErrorMessage";
import { Loading } from "../../components/ui/LoadingState";
import { useApi } from "../../hooks/useApi";
import { useApp } from "../../hooks/useApp";
import { productsService } from "../../services/products.service";
import { money } from "../../utils/formatters";

export function ProductDetailPage() {
  const { id } = useParams();
  const {
    data: p,
    loading,
    error,
    reload,
  } = useApi(() => productsService.getById(Number(id)), [id]);
  const { add, toast } = useApp();
  const [qty, setQty] = useState(1),
    [busy, setBusy] = useState(false);
  useEffect(() => setQty(1), [id]);
  return (
    <main className="page store-page">
      <Link className="back" to="/">
        ← Volver al catálogo
      </Link>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox error={error} retry={reload} />
      ) : (
        p && (
          <div className="product-detail">
            <div className="detail-photo">
              <ProductImage product={p} />
            </div>
            <div className="detail-info">
              <span className="eyebrow">{p.categoria?.nombre}</span>
              <h1>{p.nombre}</h1>
              <p className="muted">SKU {p.sku}</p>
              <h2>{money(p.precioVenta)}</h2>
              <p>
                {p.descripcion ||
                  "Consulta la información de este producto en nuestro catálogo."}
              </p>
              <span className="stock">
                <span className="dot" />
                {p.inventario?.stock} disponibles
              </span>
              <QuantitySelector
                value={qty}
                max={p.inventario?.stock}
                onChange={setQty}
              />
              <Button
                busy={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await add(p, qty);
                  } catch (e) {
                    toast((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Agregar al carrito
                <Plus size={18} />
              </Button>
            </div>
          </div>
        )
      )}
    </main>
  );
}
