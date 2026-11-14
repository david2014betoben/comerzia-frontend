import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api';
import type { Cart, User, Product } from './types';
import { Modal, Button, ErrorBox, Quantity, Empty } from './components/ui';
import { Trash2, ArrowRight, Eye, EyeOff, Package } from 'lucide-react';
import { money, total } from './utils';
type Overlay =
  | { type: 'auth'; register?: boolean }
  | { type: 'cart' }
  | { type: 'product'; product: Product }
  | null;
type Ctx = {
  user: User | null;
  cart: Cart | null;
  overlay: Overlay;
  setOverlay: (v: Overlay) => void;
  logout: () => void;
  refreshCart: () => Promise<void>;
  add: (p: Product, q?: number) => Promise<void>;
  toast: (s: string) => void;
  theme: string;
  toggleTheme: () => void;
};
const Context = createContext<Ctx>(null!);
export const useApp = () => useContext(Context);
export function Provider({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('comerzia.user') || 'null');
    } catch {
      return null;
    }
  });
  const [cart, setCart] = useState<Cart | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState(
    localStorage.getItem('comerzia.theme') || 'dark',
  );
  const [pending, setPending] = useState<{ p: Product; q: number } | null>(
    null,
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('comerzia.theme', theme);
  }, [theme]);
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(''), 4500);
      return () => clearTimeout(t);
    }
  }, [message]);
  const logout = () => {
    setUser(null);
    setCart(null);
    sessionStorage.removeItem('comerzia.token');
    sessionStorage.removeItem('comerzia.user');
    setOverlay(null);
    setPending(null);
    nav('/');
  };
  useEffect(() => {
    const fn = () => {
      setUser(null);
      setCart(null);
      setOverlay({ type: 'auth' });
      setMessage('Tu sesión venció. Inicia sesión de nuevo.');
    };
    window.addEventListener('comerzia:expired', fn);
    return () => window.removeEventListener('comerzia:expired', fn);
  }, []);
  const refreshCart = async () => {
    if (user?.rol === 'CLIENTE') setCart(await api<Cart | null>('/carts/me'));
  };
  useEffect(() => {
    if (user?.rol === 'CLIENTE')
      refreshCart().catch((e) => setMessage(e.message));
    else setCart(null);
  }, [user?.id]);
  const add = async (p: Product, q = 1) => {
    if (!user) {
      setPending({ p, q });
      setOverlay({ type: 'auth' });
      return;
    }
    if (user.rol !== 'CLIENTE') {
      setMessage(
        'Para comprar online utiliza una cuenta de cliente. Para vender, entra al punto de venta.',
      );
      return;
    }
    setCart(
      await api<Cart>('/carts/items', 'POST', {
        productoId: p.id,
        cantidad: q,
      }),
    );
    setOverlay({ type: 'cart' });
  };
  const login = async (email: string, password: string) => {
    const r = await api<{ access_token: string; usuario: User }>(
      '/auth/login',
      'POST',
      { email, password },
    );
    sessionStorage.setItem('comerzia.token', r.access_token);
    sessionStorage.setItem('comerzia.user', JSON.stringify(r.usuario));
    setUser(r.usuario);
    setOverlay(null);
    if (pending && r.usuario.rol === 'CLIENTE') {
      setCart(
        await api<Cart>('/carts/items', 'POST', {
          productoId: pending.p.id,
          cantidad: pending.q,
        }),
      );
      setPending(null);
      setOverlay({ type: 'cart' });
    } else if (r.usuario.rol !== 'CLIENTE')
      nav('/panel/' + (r.usuario.rol === 'ADMIN' ? 'productos' : 'pos'));
  };
  return (
    <Context.Provider
      value={{
        user,
        cart,
        overlay,
        setOverlay,
        logout,
        refreshCart,
        add,
        toast: setMessage,
        theme,
        toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      }}
    >
      {children}
      {message && (
        <div className="toast" role="status">
          {message}
          <button aria-label="Cerrar aviso" onClick={() => setMessage('')}>
            ×
          </button>
        </div>
      )}
      {overlay?.type === 'auth' && (
        <Auth
          key={overlay.register ? 'register' : 'login'}
          register={overlay.register}
          login={login}
        />
      )}
      {overlay?.type === 'cart' && <CartDrawer />}
      {overlay?.type === 'product' && (
        <QuickProduct product={overlay.product} />
      )}
    </Context.Provider>
  );
}
function Auth({
  register = false,
  login,
}: {
  register?: boolean;
  login: (email: string, password: string) => Promise<void>;
}) {
  const { setOverlay, toast } = useApp();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [show, setShow] = useState(false);
  return (
    <Modal
      title={register ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
      onClose={() => setOverlay(null)}
      busy={busy}
    >
      <div className="auth-mark">
        <img src="/brand.svg" alt="" />
        <span>COMERZIA</span>
      </div>
      <p className="muted">
        {register
          ? 'Tu próxima compra empieza aquí.'
          : 'Inicia sesión para continuar tu compra.'}
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setError('');
          if (register && f.get('password') !== f.get('confirm')) {
            setError('Las contraseñas no coinciden');
            return;
          }
          setBusy(true);
          try {
            if (register) {
              await api('/users/register', 'POST', {
                nombre: f.get('nombre'),
                email: f.get('email'),
                password: f.get('password'),
                ...(f.get('telefono') ? { telefono: f.get('telefono') } : {}),
              });
              toast('Cuenta creada. Ya puedes iniciar sesión.');
              setOverlay({ type: 'auth' });
            } else
              await login(String(f.get('email')), String(f.get('password')));
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {register && (
          <label>
            Nombre completo
            <input
              name="nombre"
              minLength={2}
              maxLength={100}
              required
              autoComplete="name"
            />
          </label>
        )}
        <label>
          Correo electrónico
          <input type="email" name="email" required autoComplete="email" />
        </label>
        {register && (
          <label>
            Teléfono <small>opcional</small>
            <input name="telefono" maxLength={20} autoComplete="tel" />
          </label>
        )}
        <label>
          Contraseña
          <div className="password">
            <input
              type={show ? 'text' : 'password'}
              name="password"
              required
              minLength={register ? 8 : 1}
              autoComplete={register ? 'new-password' : 'current-password'}
            />
            <button
              type="button"
              className="icon"
              onClick={() => setShow(!show)}
              aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        {register && (
          <label>
            Confirmar contraseña
            <input
              type={show ? 'text' : 'password'}
              name="confirm"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
        )}
        {error && <ErrorBox error={error} />}
        <Button busy={busy} className="full">
          {register ? 'Crear cuenta' : 'Iniciar sesión'}
          <ArrowRight size={18} />
        </Button>
      </form>
      <p className="auth-switch">
        {register ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}{' '}
        <button
          className="link"
          disabled={busy}
          onClick={() => setOverlay({ type: 'auth', register: !register })}
        >
          {register ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>
      </p>
    </Modal>
  );
}
function CartDrawer() {
  const { cart, setOverlay, refreshCart, toast } = useApp();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const lines = cart?.detalles || [];
  const change = async (id: number, q: number) => {
    setBusy(true);
    try {
      await api(`/carts/items/${id}`, 'PATCH', { cantidad: q });
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
              nav('/');
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
                  <Quantity
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
                nav('/checkout');
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
function QuickProduct({ product: p }: { product: Product }) {
  const { setOverlay, add } = useApp();
  const nav = useNavigate();
  const [qty, setQty] = useState(1),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
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
          <Quantity value={qty} max={p.inventario?.stock} onChange={setQty} />
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
