import { Search, ShoppingBag, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Brand } from "../components/layout/Brand";
import { ThemeToggle } from "../components/layout/ThemeToggle";
import { useApp } from "../hooks/useApp";

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
            <ThemeToggle />
            <div className="account-wrap">
              <button
                className="icon"
                aria-label="Cuenta"
                aria-expanded={account}
                onClick={() =>
                  user ? setAccount(!account) : setOverlay({ type: "auth" })
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
                    {user.rol !== "CLIENTE" && (
                      <Link to="/panel" onClick={() => setAccount(false)}>
                        Ir al panel
                      </Link>
                    )}
                    {user.rol === "CLIENTE" && (
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
                user?.rol === "CLIENTE"
                  ? setOverlay({ type: "cart" })
                  : user
                    ? toast("Para vender utiliza el punto de venta del panel.")
                    : setOverlay({ type: "auth" })
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
