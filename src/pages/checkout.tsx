import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  MapPin,
  Plus,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../api';
import { useApp } from '../context';
import type { Address, Order } from '../types';
import { money, total } from '../utils';
import {
  Modal,
  Button,
  Empty,
  Loading,
  ErrorBox,
  LineItems,
  Badge,
  useLoad,
} from '../components/ui';
export function AddressCard({
  a,
  selected,
  onSelect,
}: {
  a: Address;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      className={`address-card ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      disabled={!onSelect}
    >
      <div className="between">
        <strong>
          <MapPin size={17} />
          {a.alias}
        </strong>
        {a.esPrincipal && <span className="badge">Principal</span>}
      </div>
      <b>{a.destinatario}</b>
      <p>
        {a.direccion}
        <br />
        {a.ciudad} · {a.telefono}
      </p>
      {a.referencias && <small>{a.referencias}</small>}
      {onSelect && (
        <span
          className="radio"
          aria-label={selected ? 'Seleccionada' : 'Seleccionar'}
        >
          {selected ? '●' : '○'}
        </span>
      )}
    </button>
  );
}
export function AddressForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (a: Address) => void;
}) {
  const { user } = useApp();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <Modal title="Agregar dirección" onClose={onClose} busy={busy}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true);
          setError('');
          try {
            const a = await api<Address>('/addresses', 'POST', {
              alias: f.get('alias'),
              destinatario: f.get('destinatario'),
              telefono: f.get('telefono'),
              ciudad: f.get('ciudad'),
              direccion: f.get('direccion'),
              referencias: f.get('referencias') || undefined,
              esPrincipal: f.get('esPrincipal') === 'on',
            });
            onSaved(a);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {[
          ['alias', 'Alias', 'Casa', 50],
          ['destinatario', 'Destinatario', user?.nombre || '', 100],
          ['telefono', 'Teléfono', '', 30],
          ['ciudad', 'Ciudad', '', 80],
          ['direccion', 'Dirección', '', 200],
          ['referencias', 'Referencias (opcional)', '', 500],
        ].map(([name, title, placeholder, max]) => (
          <label key={name}>
            {title}
            <input
              name={String(name)}
              placeholder={String(placeholder)}
              required={name !== 'referencias'}
              maxLength={Number(max)}
            />
          </label>
        ))}
        <label className="check-label">
          <input type="checkbox" name="esPrincipal" />
          Usar como dirección principal
        </label>
        {error && <ErrorBox error={error} />}
        <div className="form-actions">
          <Button
            type="button"
            className="secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button busy={busy}>Guardar dirección</Button>
        </div>
      </form>
    </Modal>
  );
}
export function Addresses() {
  const r = useLoad(() => api<Address[]>('/addresses'));
  const [open, setOpen] = useState(false);
  return (
    <main className="page store-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">TU CUENTA</span>
          <h1>Mis direcciones</h1>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={18} />
          Agregar dirección
        </Button>
      </div>
      {r.loading ? (
        <Loading />
      ) : r.error ? (
        <ErrorBox error={r.error} retry={r.reload} />
      ) : !r.data?.length ? (
        <Empty title="¿A dónde enviamos tu próxima compra?">
          <Button onClick={() => setOpen(true)}>Agregar dirección</Button>
        </Empty>
      ) : (
        <div className="address-grid">
          {r.data.map((a) => (
            <AddressCard key={a.id} a={a} />
          ))}
        </div>
      )}
      {open && (
        <AddressForm
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            r.reload();
          }}
        />
      )}
    </main>
  );
}
export function Checkout() {
  const { cart, refreshCart } = useApp();
  const r = useLoad(() => api<Address[]>('/addresses'));
  const [selected, setSelected] = useState(0),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
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
                  setError('');
                  try {
                    const order = await api<{ pedidoId: number }>(
                      '/orders/checkout',
                      'POST',
                      { direccionId: current },
                    );
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
export function PaymentPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const r = useLoad(() => api<Order[]>('/orders/my'), [id]);
  const order = r.data?.find((o) => o.id === Number(id));
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [result, setResult] = useState<string | null>(null),
    [uncertain, setUncertain] = useState(false);
  const { toast } = useApp();
  const pay = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    setError('');
    try {
      const v = await api<{ pagoEstado: string }>(
        `/orders/${id}/payments/simulate`,
        'POST',
        { numeroTarjeta: f.get('numeroTarjeta') },
      );
      form.reset();
      setResult(v.pagoEstado === 'APROBADO' ? 'PAGADO' : 'CANCELADO');
      r.reload();
    } catch (e) {
      form.reset();
      setError((e as Error).message);
      if ((e as { status?: number }).status === 0) setUncertain(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="page store-page">
      <span className="eyebrow">COMERZIA SANDBOX</span>
      <h1>Prueba tu pago.</h1>
      <div className="steps">
        <span>01 Dirección</span>
        <span>—</span>
        <span>02 Revisión</span>
        <span>—</span>
        <b>03 Pago</b>
      </div>
      {r.loading ? (
        <Loading />
      ) : r.error ? (
        <ErrorBox error={r.error} retry={r.reload} />
      ) : !order ? (
        <Empty title="No encontramos ese pedido">
          <Link className="btn" to="/pedidos">
            Mis pedidos
          </Link>
        </Empty>
      ) : (
        <div className="checkout-grid">
          <section className="surface">
            <div className="alert">
              <AlertTriangle size={23} />
              <span>
                <b>Simulación de pago</b>
                <br />
                No se realizarán cobros. Usa únicamente datos inventados.
              </span>
            </div>
            {order.estado !== 'PENDIENTE' ? (
              <div className="result">
                <CheckCircle2 size={42} />
                <h2>
                  Pedido {order.estado === 'CANCELADO' ? 'cancelado' : 'pagado'}
                </h2>
                <Badge value={order.estado} />
                <p>Consulta el detalle en Mis pedidos.</p>
                <Link className="btn" to="/pedidos">
                  Ver mis pedidos
                </Link>
              </div>
            ) : uncertain ? (
              <div className="result">
                <AlertTriangle size={42} />
                <h2>No pudimos confirmar el resultado</h2>
                <p>Consulta tus pedidos antes de intentar otra operación.</p>
                <Link className="btn" to="/pedidos">
                  Consultar mis pedidos
                </Link>
              </div>
            ) : (
              <>
                <div className="credit-card">
                  <span>
                    COMERZIA <small>DEMO</small>
                  </span>
                  <CreditCard size={32} />
                  <strong>•••• &nbsp; •••• &nbsp; •••• &nbsp; 4040</strong>
                  <span>SOLO DATOS INVENTADOS</span>
                </div>
                <form autoComplete="off" onSubmit={pay}>
                  <fieldset disabled={busy}>
                    <label>
                      Titular <small>ilustrativo</small>
                      <input
                        name="titular"
                        placeholder="Nombre inventado"
                        autoComplete="off"
                      />
                    </label>
                    <label>
                      Número de tarjeta ficticia
                      <input
                        name="numeroTarjeta"
                        required
                        inputMode="numeric"
                        maxLength={32}
                        pattern="[0-9][0-9 -]*"
                        placeholder="4040 1234 5678 9012"
                        autoComplete="off"
                      />
                    </label>
                    <div className="form-grid">
                      <label>
                        Vencimiento <small>ilustrativo</small>
                        <input
                          name="vencimiento"
                          placeholder="MM/AA"
                          maxLength={5}
                          autoComplete="off"
                        />
                      </label>
                      <label>
                        CVV <small>ilustrativo</small>
                        <input
                          name="cvv"
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="•••"
                          autoComplete="off"
                        />
                      </label>
                    </div>
                    <p className="fine-print">
                      Prefijo <b>4040</b>: aprobado. Otros prefijos: rechazado.
                      Los demás campos no determinan la aprobación.
                    </p>
                    {error && <ErrorBox error={error} />}
                    <Button className="full" busy={busy}>
                      {busy ? 'Procesando simulación…' : 'Simular pago'}
                    </Button>
                  </fieldset>
                </form>
              </>
            )}
          </section>
          <aside className="surface order-summary">
            <div className="between">
              <h2>Pedido #{order.id}</h2>
              <Badge value={order.estado} />
            </div>
            <LineItems lines={order.detalles} />
            <div className="summary-total">
              <span>Total</span>
              <strong>{money(order.totalProductos)}</strong>
            </div>
            <p className="muted">
              {order.destinatario}
              <br />
              {order.direccionDestino}
              <br />
              {order.ciudadDestino}
            </p>
          </aside>
        </div>
      )}
      {result && (
        <Modal
          title={
            result === 'PAGADO'
              ? 'Pago de prueba aprobado'
              : 'Pago de prueba rechazado'
          }
          onClose={() => setResult(null)}
        >
          <div className="result">
            {result === 'PAGADO' ? (
              <CheckCircle2 size={54} className="lime-text" />
            ) : (
              <AlertTriangle size={54} />
            )}
            <h2>
              {result === 'PAGADO'
                ? 'Tu pedido ya está pagado'
                : 'Tu pedido fue cancelado'}
            </h2>
            <p>
              {result === 'PAGADO'
                ? 'La simulación se completó correctamente.'
                : 'El stock reservado volvió al inventario.'}
            </p>
            <p>
              Pedido #{id} · {money(order?.totalProductos)}
            </p>
            <Badge value={result} />
            <Button
              className="full"
              onClick={() => {
                setResult(null);
                nav('/pedidos');
              }}
            >
              Ver mis pedidos
            </Button>
            <button
              className="link"
              onClick={() => {
                toast('Gracias por probar Comerzia');
                nav('/');
              }}
            >
              Seguir comprando
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
