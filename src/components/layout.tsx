import { useState } from 'react';
import { Link, NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import {
  Sun,
  Moon,
  ShoppingBag,
  UserRound,
  Search,
  Menu,
  X,
  Boxes,
  Tags,
  Monitor,
  Wallet,
  Receipt,
  Truck,
  UserPlus,
  ArrowUpRight,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context';
export function Brand() {
  return (
    <Link className="brand" to="/">
      <img src="/brand.svg" alt="" />
      <span>COMERZIA</span>
    </Link>
  );
}
export function ThemeButton() {
  const { theme, toggleTheme } = useApp();
  return (
    <button
      className="icon"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
      aria-label={
        theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'
      }
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
export function StoreLayout() {
  const { user, cart, setOverlay, logout, toast } = useApp();
  const [account, setAccount] = useState(false);
  return (
    <>
      <header className="store-header">
        <div className="header-inner">
          <Brand />
          <Link className="header-search" to="/?buscar=1">
            <Search size={18} />
            <span>¿Qué estás buscando?</span>
            <kbd>⌕</kbd>
          </Link>
          <nav className="header-nav">
            <Link to="/pedidos">Mis pedidos</Link>
          </nav>
          <div className="header-actions">
            <ThemeButton />
            <div className="account-wrap">
              <button
                className="icon"
                aria-label="Cuenta"
                aria-expanded={account}
                onClick={() =>
                  user ? setAccount(!account) : setOverlay({ type: 'auth' })
                }
              >
                <UserRound size={21} />
              </button>
              {account && user && (
                <>
                  <button
                    className="menu-dismiss"
                    aria-label="Cerrar menú"
                    onClick={() => setAccount(false)}
                  />
                  <div className="account-menu">
                    <strong>{user.nombre}</strong>
                    <small>{user.email}</small>
                    {user.rol !== 'CLIENTE' && (
                      <Link to="/panel" onClick={() => setAccount(false)}>
                        Ir al panel
                      </Link>
                    )}
                    {user.rol === 'CLIENTE' && (
                      <>
                        <Link to="/pedidos" onClick={() => setAccount(false)}>
                          Mis pedidos
                        </Link>
                        <Link
                          to="/direcciones"
                          onClick={() => setAccount(false)}
                        >
                          Mis direcciones
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setAccount(false);
                        logout();
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
            <button
              className="icon bag"
              aria-label="Abrir carrito"
              onClick={() =>
                user?.rol === 'CLIENTE'
                  ? setOverlay({ type: 'cart' })
                  : user
                    ? toast('Para vender utiliza el punto de venta del panel.')
                    : setOverlay({ type: 'auth' })
              }
            >
              <ShoppingBag size={21} />
              {!!cart?.detalles.length && (
                <span>{cart.detalles.reduce((s, l) => s + l.cantidad, 0)}</span>
              )}
            </button>
          </div>
        </div>
      </header>
      <Outlet />
      <footer className="store-footer">
        <Brand />
        <p>Objetos que acompañan tu día.</p>
        <span>COMERZIA · Tienda & punto de venta</span>
      </footer>
    </>
  );
}
const sections = [
  ['productos', 'Productos', Boxes],
  ['categorias', 'Categorías', Tags],
  ['pos', 'Punto de venta', Monitor],
  ['caja', 'Caja', Wallet],
  ['ventas', 'Ventas', Receipt],
  ['pedidos', 'Pedidos', Truck],
  ['personal', 'Crear personal', UserPlus],
] as const;
export function StaffLayout() {
  const { user, logout } = useApp();
  const [open, setOpen] = useState(false);
  if (!user) return <Navigate to="/acceso" replace />;
  if (user.rol === 'CLIENTE') return <Navigate to="/403" replace />;
  return (
    <div className="staff-layout">
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Cerrar navegación"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="between">
          <Brand />
          <button
            className="icon mobile-only"
            aria-label="Cerrar navegación"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>
        <div className="workspace-label">ESPACIO DE TRABAJO</div>
        <nav>
          {sections
            .filter(
              ([id]) =>
                user.rol === 'ADMIN' ||
                ['pos', 'caja', 'ventas', 'pedidos'].includes(id),
            )
            .map(([id, name, Icon]) => (
              <NavLink
                key={id}
                to={`/panel/${id}`}
                onClick={() => setOpen(false)}
              >
                <Icon size={19} />
                {user.rol === 'CAJERO' && id === 'caja'
                  ? 'Mi caja'
                  : user.rol === 'CAJERO' && id === 'ventas'
                    ? 'Mis ventas'
                    : name}
              </NavLink>
            ))}
        </nav>
        <div className="sidebar-foot">
          <Link to="/">
            <ArrowUpRight size={18} />
            Ver tienda
          </Link>
          <button onClick={logout}>
            <LogOut size={18} />
            Cerrar sesión
          </button>
          <div className="user-chip">
            <span>{user.nombre.slice(0, 1)}</span>
            <div>
              <b>{user.nombre}</b>
              <small>{user.rol}</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="staff-content">
        <header className="staff-header">
          <button
            className="icon mobile-only"
            onClick={() => setOpen(true)}
            aria-label="Abrir navegación"
          >
            <Menu />
          </button>
          <span>
            Panel operativo <span className="muted">/ Comerzia</span>
          </span>
          <div className="header-actions">
            <ThemeButton />
            <span className="badge">{user.rol}</span>
          </div>
        </header>
        <main className="staff-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
export function RequireClient({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const location = useLocation();
  if (!user)
    return (
      <Navigate to="/acceso" state={{ volver: location.pathname }} replace />
    );
  if (user.rol !== 'CLIENTE') return <Navigate to="/403" replace />;
  return <>{children}</>;
}
