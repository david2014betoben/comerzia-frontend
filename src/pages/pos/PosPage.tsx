import {
  ArrowRight,
  CheckCircle2,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { OpenCashModal } from "../../components/cash/OpenCashModal";
import { LineItems } from "../../components/products/LineItems";
import { QuantitySelector } from "../../components/products/QuantitySelector";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Empty } from "../../components/ui/EmptyState";
import { ErrorBox } from "../../components/ui/ErrorMessage";
import { Loading } from "../../components/ui/LoadingState";
import { Modal } from "../../components/ui/Modal";
import { useApi } from "../../hooks/useApi";
import { useApp } from "../../hooks/useApp";
import { cashService } from "../../services/cash.service";
import { categoriesService } from "../../services/categories.service";
import { posService } from "../../services/pos.service";
import { productsService } from "../../services/products.service";
import type { Product } from "../../types/products";
import type { Sale } from "../../types/sales";
import { label, money } from "../../utils/formatters";

export function PosPage() {
  const { toast, user } = useApp();
  const products = useApi(() => productsService.getForStaff());
  const cats = useApi(() => categoriesService.getAll());
  const cash = useApi(() => cashService.getCurrent());
  const [sale, setSale] = useState<Sale | null>(null),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [open, setOpen] = useState(false),
    [pay, setPay] = useState(false),
    [method, setMethod] = useState("EFECTIVO"),
    [mobile, setMobile] = useState(false),
    [uncertain, setUncertain] = useState(false);
  const key = `comerzia.sale.${user?.id}`;
  useEffect(() => {
    let active = true;
    if (!cash.data) return;
    const saved = sessionStorage.getItem(key);
    if (saved) {
      try {
        const v = JSON.parse(saved);
        if (v.sesionCajaId === cash.data.id) {
          posService
            .getById(v.id)
            .then((current) => {
              if (!active) return;
              if (current.estado === "ABIERTA") setSale(current);
              else {
                sessionStorage.removeItem(key);
                toast(
                  "La venta anterior ya fue procesada. Puedes comenzar otra.",
                );
              }
            })
            .catch((e) => {
              if (active) setError(e.message);
            });
        } else sessionStorage.removeItem(key);
      } catch {
        sessionStorage.removeItem(key);
      }
    }
    return () => {
      active = false;
    };
  }, [cash.data?.id]);
  useEffect(() => {
    if (sale?.estado === "ABIERTA")
      sessionStorage.setItem(key, JSON.stringify(sale));
    else if (sale) sessionStorage.removeItem(key);
  }, [sale]);
  const add = async (p: Product) => {
    setBusy(true);
    setError("");
    try {
      let current = sale;
      if (!current || current.estado !== "ABIERTA") {
        current = await posService.open(cash.data!.id);
        setSale(current);
      }
      setSale(
        await posService.addItem(current.id, {
          productoId: p.id,
          cantidad: 1,
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const quantity = async (id: number, q: number) => {
    if (!sale) return;
    setBusy(true);
    setError("");
    try {
      setSale(await posService.setQuantity(sale.id, id, q));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const cart = (
    <>
      <div className="between">
        <h2>Venta actual</h2>
        <span className="badge">
          {sale?.detalles.reduce((s, l) => s + l.cantidad, 0) || 0} unidades
        </span>
      </div>
      <small className="muted">
        {sale?.numeroComprobante || "Lista para comenzar"}
      </small>
      <div className="pos-lines">
        {!sale?.detalles.length ? (
          <Empty title="Tu venta comienza aquí">
            <p>Selecciona productos del catálogo.</p>
          </Empty>
        ) : (
          sale.detalles.map((l) => (
            <div className="line" key={l.producto.id}>
              <div className="grow">
                <strong>{l.producto.nombre}</strong>
                <small>{money(l.precioUnitario)}</small>
                <QuantitySelector
                  value={l.cantidad}
                  disabled={busy}
                  onChange={(q) => quantity(l.producto.id, q)}
                />
              </div>
              <b>{money(l.subtotal)}</b>
              <button
                className="icon"
                disabled={busy}
                aria-label={`Quitar ${l.producto.nombre}`}
                onClick={() => quantity(l.producto.id, 0)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="drawer-bottom">
        <div className="summary-total">
          <span>Total</span>
          <strong>{money(sale?.total)}</strong>
        </div>
        {uncertain ? (
          <Link className="btn full" to="/panel/ventas">
            Consultar ventas antes de repetir
          </Link>
        ) : (
          <Button
            className="full lime"
            disabled={!sale?.detalles.length || busy || !cash.data}
            onClick={() => {
              setMobile(false);
              setPay(true);
            }}
          >
            Cobrar
            <ArrowRight size={18} />
          </Button>
        )}
      </div>
    </>
  );
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">VENTA DE MOSTRADOR</span>
          <h1>Punto de venta</h1>
        </div>
        {cash.data && (
          <span className="badge">
            Caja #{cash.data.id} · {user?.nombre}
          </span>
        )}
      </div>
      {cash.loading ? (
        <Loading />
      ) : cash.error ? (
        <ErrorBox error={cash.error} retry={cash.reload} />
      ) : (
        !cash.data && (
          <div className="alert">
            <Wallet />
            <span>Abre tu caja para comenzar a vender.</span>
            <Button onClick={() => setOpen(true)}>Abrir caja</Button>
          </div>
        )
      )}
      {error && <ErrorBox error={error} />}
      <div className="pos-grid">
        <section>
          <div className="search-wrap">
            <Search size={18} />
            <input
              placeholder="Buscar producto o SKU…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="chips">
            <button
              className={!category ? "active" : ""}
              onClick={() => setCategory(0)}
            >
              Todos
            </button>
            {cats.data?.map((c) => (
              <button
                key={c.id}
                className={category === c.id ? "active" : ""}
                onClick={() => setCategory(c.id)}
              >
                {c.nombre}
              </button>
            ))}
          </div>
          {products.loading ? (
            <Loading />
          ) : products.error ? (
            <ErrorBox error={products.error} retry={products.reload} />
          ) : (
            <div className="pos-products">
              {products.data
                ?.filter(
                  (p) =>
                    p.activo &&
                    (!category || p.categoriaId === category) &&
                    `${p.nombre} ${p.sku}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                )
                .map((p) => (
                  <button
                    className="pos-product"
                    disabled={busy || !cash.data || !p.inventario?.stock}
                    key={p.id}
                    onClick={() => add(p)}
                  >
                    <div className="pos-product-art">
                      <ShoppingBag size={33} strokeWidth={1} />
                      <span>
                        <Plus size={16} />
                      </span>
                    </div>
                    <small>{p.sku}</small>
                    <strong>{p.nombre}</strong>
                    <div className="between">
                      <b>{money(p.precioVenta)}</b>
                      <small>{p.inventario?.stock ?? 0} disp.</small>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </section>
        <aside className="surface pos-sale">{cart}</aside>
      </div>
      <div className="mobile-sale-bar">
        <span>
          {sale?.detalles.length || 0} productos · <b>{money(sale?.total)}</b>
        </span>
        <Button onClick={() => setMobile(true)}>Ver venta</Button>
      </div>
      {mobile && (
        <Modal
          title="Venta actual"
          drawer
          busy={busy}
          onClose={() => setMobile(false)}
        >
          {cart}
        </Modal>
      )}
      {open && (
        <OpenCashModal
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            cash.reload();
          }}
        />
      )}
      {pay && sale && (
        <Modal
          title={sale.estado === "PAGADA" ? "Venta registrada" : "Cobrar venta"}
          busy={busy}
          onClose={() => {
            setPay(false);
            if (sale.estado === "PAGADA") setSale(null);
          }}
        >
          {sale.estado === "PAGADA" ? (
            <>
              <div className="result">
                <CheckCircle2 size={48} className="lime-text" />
                <h2>Venta registrada</h2>
                <p>{sale.numeroComprobante}</p>
                <Badge value="PAGADA" />
              </div>
              <LineItems lines={sale.detalles} />
              <div className="summary-total">
                <span>{label(sale.metodoPago || "")}</span>
                <strong>{money(sale.total)}</strong>
              </div>
              <Button
                className="full"
                onClick={() => {
                  setSale(null);
                  setPay(false);
                  products.reload();
                }}
              >
                Nueva venta
              </Button>
              <Link className="link full" to="/panel/ventas">
                Ver ventas
              </Link>
            </>
          ) : (
            <>
              <p className="muted">{sale.numeroComprobante}</p>
              <LineItems lines={sale.detalles} />
              <div className="summary-total">
                <span>Total a cobrar</span>
                <strong>{money(sale.total)}</strong>
              </div>
              <h3>Método de pago</h3>
              <div className="payment-methods">
                {["EFECTIVO", "TARJETA", "TRANSFERENCIA", "QR"].map((m) => (
                  <button
                    key={m}
                    className={method === m ? "selected" : ""}
                    disabled={busy}
                    onClick={() => setMethod(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <p className="fine-print">
                Registro manual: confirma el cobro antes de continuar.
              </p>
              {error && <ErrorBox error={error} />}
              {uncertain ? (
                <Link className="btn full" to="/panel/ventas">
                  Consultar ventas
                </Link>
              ) : (
                <Button
                  className="full lime"
                  busy={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError("");
                    try {
                      setSale(await posService.pay(sale.id, method));
                      products.reload();
                      toast("Venta registrada");
                    } catch (e) {
                      setError((e as Error).message);
                      if ((e as { status?: number }).status === 0)
                        setUncertain(true);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Confirmar cobro
                </Button>
              )}
            </>
          )}
        </Modal>
      )}
    </>
  );
}
