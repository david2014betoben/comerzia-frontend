import {
  ArrowUpRight,
  Boxes,
  LogOut,
  Menu,
  Monitor,
  Receipt,
  Tags,
  Truck,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, Navigate, NavLink, Outlet } from "react-router-dom";
import { Brand } from "../components/layout/Brand";
import { ThemeToggle } from "../components/layout/ThemeToggle";
import { useApp } from "../hooks/useApp";

const sections = [
  ["productos", "Productos", Boxes],
  ["categorias", "Categorías", Tags],
  ["pos", "Punto de venta", Monitor],
  ["caja", "Caja", Wallet],
  ["ventas", "Ventas", Receipt],
  ["pedidos", "Pedidos", Truck],
  ["personal", "Crear personal", UserPlus],
] as const;

export function StaffLayout() {
  const { user, logout } = useApp();
  const [open, setOpen] = useState(false);
  if (!user) return <Navigate to="/acceso" replace />;
  if (user.rol === "CLIENTE") return <Navigate to="/403" replace />;
  return (
    <div className="staff-layout">
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Cerrar navegación"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
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
                user.rol === "ADMIN" ||
                ["pos", "caja", "ventas", "pedidos"].includes(id),
            )
            .map(([id, name, Icon]) => (
              <NavLink
                key={id}
                to={`/panel/${id}`}
                onClick={() => setOpen(false)}
              >
                <Icon size={19} />
                {user.rol === "CAJERO" && id === "caja"
                  ? "Mi caja"
                  : user.rol === "CAJERO" && id === "ventas"
                    ? "Mis ventas"
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
            <ThemeToggle />
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
