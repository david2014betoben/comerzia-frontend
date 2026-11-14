import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  RefreshCw,
  Truck,
  Package,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../api';
import { useApp } from '../context';
import type { Order, Product, Line } from '../types';
import { money, date, label, total } from '../utils';
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
export function OrderDetail({
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
    [error, setError] = useState('');
  const next =
    o.estado === 'PAGADO'
      ? 'EN_CAMINO'
      : o.estado === 'EN_CAMINO'
        ? 'ENTREGADO'
        : null;
  const { toast } = useApp();
  return (
    <Modal title={`Pedido #${o.id}`} drawer onClose={onClose} busy={busy}>
      <div className="between">
        <small>{date(o.createdAt)}</small>
        <Badge value={o.estado} />
      </div>
      {['PAGADO', 'EN_CAMINO', 'ENTREGADO'].includes(o.estado) && (
        <div className="progress">
          {['PAGADO', 'EN_CAMINO', 'ENTREGADO'].map((s, i) => (
            <div
              className={
                i <= ['PAGADO', 'EN_CAMINO', 'ENTREGADO'].indexOf(o.estado)
                  ? 'done'
                  : ''
              }
              key={s}
            >
              <span>{i + 1}</span>
              {label(s)}
            </div>
          ))}
        </div>
      )}
      {o.estado === 'PENDIENTE' && (
        <div className="alert">Esperando confirmación del pago.</div>
      )}
      {o.estado === 'CANCELADO' && (
        <div className="alert danger">
          Pedido cancelado.
          {o.pagos?.some((p) => p.estado === 'RECHAZADO') &&
            ' El pago fue rechazado y el stock reservado fue liberado.'}
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
            {p.metodo === 'PASARELA' ? 'Pago simulado' : label(p.metodo)}
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
                    await api(`/orders/${o.id}/status`, 'PATCH', {
                      estado: next,
                    });
                    toast(
                      next === 'ENTREGADO'
                        ? 'Pedido entregado y retirado de la cola.'
                        : 'Pedido marcado en camino.',
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
      {!staff && o.estado === 'PENDIENTE' && (
        <Link className="btn full" to={`/pago/${o.id}`}>
          Continuar pago de prueba
        </Link>
      )}
    </Modal>
  );
}
export function Orders({ staff = false }: { staff?: boolean }) {
  const r = useLoad(
    () => api<Order[]>(staff ? '/orders/queue' : '/orders/my'),
    [staff],
  );
  const [status, setStatus] = useState(''),
    [origin, setOrigin] = useState(''),
    [query, setQuery] = useState(''),
    [selected, setSelected] = useState<Order | null>(null),
    [social, setSocial] = useState(false);
  const list = (r.data || []).filter(
    (o) =>
      (!status || o.estado === status) &&
      (!origin || o.origen === origin) &&
      `${o.id} ${o.destinatario}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main className={staff ? '' : 'page store-page'}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">{staff ? 'OPERACIONES' : 'TU CUENTA'}</span>
          <h1>{staff ? 'Pedidos' : 'Mis pedidos'}</h1>
          <p className="muted">
            {staff
              ? 'Gestiona los pedidos pendientes de entrega.'
              : 'Cada compra, en un solo lugar.'}
          </p>
        </div>
        <div className="form-actions">
          <Button className="secondary" onClick={r.reload}>
            <RefreshCw size={16} />
            Actualizar
          </Button>
          {staff ? (
            <Button onClick={() => setSocial(true)}>
              <Plus size={17} />
              Nuevo pedido de redes
            </Button>
          ) : (
            <Link className="link" to="/">
              Seguir explorando
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
      <div className="toolbar">
        <div className="chips">
          {[
            '',
            'PENDIENTE',
            'PAGADO',
            'EN_CAMINO',
            ...(!staff ? ['ENTREGADO', 'CANCELADO'] : []),
          ].map((s) => (
            <button
              key={s}
              className={status === s ? 'active' : ''}
              onClick={() => setStatus(s)}
            >
              {s ? label(s) : 'Todos'}
            </button>
          ))}
        </div>
        {staff && (
          <>
            <select
              aria-label="Origen"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            >
              <option value="">Todos los orígenes</option>
              <option value="WEB">Web</option>
              <option value="REDES_SOCIALES">Redes sociales</option>
            </select>
            <input
              placeholder="Buscar pedido o destinatario…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </>
        )}
      </div>
      {r.loading ? (
        <Loading />
      ) : r.error ? (
        <ErrorBox error={r.error} retry={r.reload} />
      ) : !list.length ? (
        <Empty
          title={
            staff
              ? 'No hay pedidos en esta cola'
              : 'Todavía no hay pedidos aquí'
          }
        >
          {!staff && (
            <Link className="btn" to="/">
              Explorar productos
            </Link>
          )}
        </Empty>
      ) : (
        <div className="order-list">
          {list.map((o) => (
            <article className="order-row" key={o.id}>
              <div className="order-symbol">
                {o.estado === 'EN_CAMINO' ? <Truck /> : <Package />}
              </div>
              <div>
                <strong>Pedido #{o.id}</strong>
                <small>{date(o.createdAt)}</small>
              </div>
              <div className="grow">
                <strong>{o.destinatario}</strong>
                <small>
                  {staff
                    ? label(o.origen)
                    : `${o.detalles.reduce((s, l) => s + l.cantidad, 0)} unidades`}
                </small>
              </div>
              <Badge value={o.estado} />
              <b>{money(o.totalProductos)}</b>
              <Button className="secondary" onClick={() => setSelected(o)}>
                Ver detalle
                <ArrowRight size={15} />
              </Button>
            </article>
          ))}
        </div>
      )}
      {selected && (
        <OrderDetail
          o={selected}
          staff={staff}
          onClose={() => setSelected(null)}
          onChanged={r.reload}
        />
      )}
      {social && (
        <SocialOrder
          onClose={() => setSocial(false)}
          onSaved={() => {
            setSocial(false);
            r.reload();
          }}
        />
      )}
    </main>
  );
}
function SocialOrder({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const r = useLoad(() => api<Product[]>('/products/manage'));
  const [lines, setLines] = useState<Line[]>([]),
    [query, setQuery] = useState(''),
    [review, setReview] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [uncertain, setUncertain] = useState(false);
  const [delivery, setDelivery] = useState<Record<string, string>>({});
  const [method, setMethod] = useState('EFECTIVO');
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
                  const order = await api<Order>('/orders/social', 'POST', {
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
            setDelivery(
              Object.fromEntries(
                [...f.entries()].map(([k, v]) => [k, String(v)]),
              ),
            );
            setReview(true);
          }}
        >
          <h3>01 · Datos de entrega</h3>
          <div className="form-grid">
            {[
              ['destinatario', 'Destinatario', 100],
              ['telefono', 'Teléfono', 30],
              ['ciudad', 'Ciudad', 80],
              ['direccion', 'Dirección', 200],
              ['referencias', 'Referencias (opcional)', 500],
            ].map(([k, t, max]) => (
              <label key={k}>
                {t}
                <input
                  name={String(k)}
                  defaultValue={delivery[k]}
                  required={k !== 'referencias'}
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
              <Quantity
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
            {['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'QR'].map((m) => (
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
