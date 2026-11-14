import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ShoppingBag,
  Trash2,
  CheckCircle2,
  Wallet,
  Search,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { api } from '../api';
import { useApp } from '../context';
import type { Cash, Product, Sale, Category } from '../types';
import { money, date, today, label } from '../utils';
import {
  Modal,
  Button,
  Loading,
  ErrorBox,
  Empty,
  LineItems,
  Badge,
  useLoad,
  Quantity,
} from '../components/ui';
export function OpenCash({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useApp();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <Modal title="Abrir caja" onClose={onClose} busy={busy}>
      <p className="muted">
        {user?.nombre} · Efectivo disponible al comenzar la sesión.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          try {
            await api('/cash/sessions/open', 'POST', {
              montoInicial: Number(
                new FormData(e.currentTarget).get('montoInicial'),
              ),
            });
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
export function CashPage() {
  const { user, toast } = useApp();
  const r = useLoad(() => api<Cash | null>('/cash/sessions/current'));
  const [open, setOpen] = useState(false),
    [close, setClose] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [result, setResult] = useState<Record<string, string> | null>(null);
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">CONTROL DE EFECTIVO</span>
          <h1>{user?.rol === 'ADMIN' ? 'Caja' : 'Mi caja'}</h1>
          <p className="muted">Comienza tu sesión con todo en orden.</p>
        </div>
        {user?.rol === 'ADMIN' && (
          <Button
            className="secondary"
            onClick={() => {
              setError('');
              setResult(null);
              setClose(true);
            }}
          >
            Cerrar una sesión
          </Button>
        )}
      </div>
      {r.loading ? (
        <Loading />
      ) : r.error ? (
        <ErrorBox error={r.error} retry={r.reload} />
      ) : r.data ? (
        <section className="surface cash-card">
          <div className="between">
            <Wallet size={36} />
            <Badge value="ABIERTA" />
          </div>
          <h2>Sesión #{r.data.id}</h2>
          <p className="muted">
            {user?.nombre}
            <br />
            Apertura: {date(r.data.abiertaEn)}
          </p>
          <small>Monto inicial</small>
          <h1>{money(r.data.montoInicial)}</h1>
          <Link className="btn" to="/panel/pos">
            Ir al punto de venta
            <ArrowRight size={18} />
          </Link>
          {user?.rol === 'CAJERO' && (
            <p className="fine-print">El cierre lo realiza un administrador.</p>
          )}
        </section>
      ) : (
        <Empty title="Tu caja aún no está abierta">
          <p>Registra el efectivo inicial para comenzar.</p>
          <Button onClick={() => setOpen(true)}>
            <Plus size={18} />
            Abrir caja
          </Button>
        </Empty>
      )}
      {open && (
        <OpenCash
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            r.reload();
            toast('Caja abierta');
          }}
        />
      )}
      {close && (
        <Modal
          title={result ? 'Resumen del cierre' : 'Cerrar sesión de caja'}
          onClose={() => setClose(false)}
          busy={busy}
        >
          {result ? (
            <>
              <div className="result">
                <CheckCircle2 size={42} />
                <h2>
                  {Number(result.diferencia) === 0
                    ? 'Caja cuadrada'
                    : Number(result.diferencia) > 0
                      ? 'Sobrante'
                      : 'Faltante'}
                </h2>
              </div>
              {[
                ['sesionId', 'Sesión'],
                ['ventasTotalesPOS', 'Ventas totales POS'],
                ['ventasEnEfectivo', 'Ventas en efectivo'],
                ['efectivoEsperado', 'Efectivo esperado'],
                ['efectivoContado', 'Efectivo contado'],
                ['diferencia', 'Diferencia'],
              ].map(([k, t]) => (
                <div className="summary-row" key={k}>
                  <span>{t}</span>
                  <b>{k === 'sesionId' ? result[k] : money(result[k])}</b>
                </div>
              ))}
              <Button className="full" onClick={() => setClose(false)}>
                Cerrar resumen
              </Button>
            </>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                if (f.get('confirm') !== 'on') return;
                setBusy(true);
                setError('');
                try {
                  const v = await api<Record<string, string>>(
                    `/cash/sessions/${f.get('sesionId')}/close`,
                    'POST',
                    { efectivoContado: Number(f.get('efectivoContado')) },
                  );
                  setResult(v);
                  r.reload();
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label>
                ID de sesión
                <input
                  name="sesionId"
                  type="number"
                  min="1"
                  step="1"
                  required
                  defaultValue={r.data?.id}
                />
              </label>
              <label>
                Efectivo contado (USD)
                <input
                  name="efectivoContado"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
              </label>
              <label className="check-label">
                <input name="confirm" type="checkbox" required />
                Confirmo que el conteo está completo.
              </label>
              <div className="alert">
                El cierre es definitivo. El resumen se calculará al confirmar.
              </div>
              {error && <ErrorBox error={error} />}
              <Button busy={busy} className="full">
                Confirmar cierre
              </Button>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
export function Pos() {
  const { toast, user } = useApp();
  const products = useLoad(() => api<Product[]>('/products/manage'));
  const cats = useLoad(() => api<Category[]>('/categories'));
  const cash = useLoad(() => api<Cash | null>('/cash/sessions/current'));
  const [sale, setSale] = useState<Sale | null>(null),
    [query, setQuery] = useState(''),
    [category, setCategory] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [open, setOpen] = useState(false),
    [pay, setPay] = useState(false),
    [method, setMethod] = useState('EFECTIVO'),
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
          api<Sale>(`/pos/sales/${v.id}`)
            .then((current) => {
              if (!active) return;
              if (current.estado === 'ABIERTA') setSale(current);
              else {
                sessionStorage.removeItem(key);
                toast(
                  'La venta anterior ya fue procesada. Puedes comenzar otra.',
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
    if (sale?.estado === 'ABIERTA')
      sessionStorage.setItem(key, JSON.stringify(sale));
    else if (sale) sessionStorage.removeItem(key);
  }, [sale]);
  const add = async (p: Product) => {
    setBusy(true);
    setError('');
    try {
      let current = sale;
      if (!current || current.estado !== 'ABIERTA') {
        current = await api<Sale>('/pos/sales', 'POST', {
          sesionCajaId: cash.data!.id,
        });
        setSale(current);
      }
      setSale(
        await api<Sale>(`/pos/sales/${current.id}/items`, 'POST', {
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
    setError('');
    try {
      setSale(
        await api<Sale>(`/pos/sales/${sale.id}/items/${id}`, 'PATCH', {
          cantidad: q,
        }),
      );
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
        {sale?.numeroComprobante || 'Lista para comenzar'}
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
                <Quantity
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
              className={!category ? 'active' : ''}
              onClick={() => setCategory(0)}
            >
              Todos
            </button>
            {cats.data?.map((c) => (
              <button
                key={c.id}
                className={category === c.id ? 'active' : ''}
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
        <OpenCash
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            cash.reload();
          }}
        />
      )}
      {pay && sale && (
        <Modal
          title={sale.estado === 'PAGADA' ? 'Venta registrada' : 'Cobrar venta'}
          busy={busy}
          onClose={() => {
            setPay(false);
            if (sale.estado === 'PAGADA') setSale(null);
          }}
        >
          {sale.estado === 'PAGADA' ? (
            <>
              <div className="result">
                <CheckCircle2 size={48} className="lime-text" />
                <h2>Venta registrada</h2>
                <p>{sale.numeroComprobante}</p>
                <Badge value="PAGADA" />
              </div>
              <LineItems lines={sale.detalles} />
              <div className="summary-total">
                <span>{label(sale.metodoPago || '')}</span>
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
                {['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'QR'].map((m) => (
                  <button
                    key={m}
                    className={method === m ? 'selected' : ''}
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
                    setError('');
                    try {
                      setSale(
                        await api<Sale>(`/pos/sales/${sale.id}/pay`, 'POST', {
                          metodoPago: method,
                        }),
                      );
                      products.reload();
                      toast('Venta registrada');
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
export function Sales() {
  const { user } = useApp();
  const [day, setDay] = useState(today());
  const r = useLoad(() => api<Sale[]>(`/pos/sales?fecha=${day}`), [day]);
  const [selected, setSelected] = useState<Sale | null>(null);
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">HISTORIAL POS</span>
          <h1>{user?.rol === 'CAJERO' ? 'Mis ventas' : 'Ventas'}</h1>
          <p className="muted">Consulta tus comprobantes y cobros.</p>
        </div>
        <Link className="btn" to="/panel/pos">
          Punto de venta
          <ArrowRight size={17} />
        </Link>
      </div>
      <div className="surface table-surface">
        <div className="toolbar">
          <label>
            Fecha
            <input
              type="date"
              value={day}
              onChange={(e) => {
                if (e.target.value) setDay(e.target.value);
              }}
            />
          </label>
          <Button className="secondary" onClick={r.reload}>
            <RefreshCw size={16} />
            Actualizar
          </Button>
        </div>
        {r.loading ? (
          <Loading />
        ) : r.error ? (
          <ErrorBox error={r.error} retry={r.reload} />
        ) : !r.data?.length ? (
          <Empty title="Sin ventas en esta fecha" />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Comprobante</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Método</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {r.data.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.numeroComprobante}</strong>
                    </td>
                    <td>{date(s.createdAt)}</td>
                    <td>
                      <Badge value={s.estado} />
                    </td>
                    <td>
                      {s.metodoPago
                        ? label(s.metodoPago)
                        : 'Pendiente de cobro'}
                    </td>
                    <td>
                      <b>{money(s.total)}</b>
                    </td>
                    <td>
                      <Button
                        className="secondary"
                        onClick={() => setSelected(s)}
                      >
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selected && (
        <Modal
          title={selected.numeroComprobante}
          drawer
          onClose={() => setSelected(null)}
        >
          <div className="between">
            <small>{date(selected.createdAt)}</small>
            <Badge value={selected.estado} />
          </div>
          <LineItems lines={selected.detalles} />
          <div className="summary-total">
            <span>Total</span>
            <strong>{money(selected.total)}</strong>
          </div>
          <p className="muted">
            {selected.metodoPago
              ? label(selected.metodoPago)
              : 'Pendiente de cobro'}
          </p>
        </Modal>
      )}
    </>
  );
}
