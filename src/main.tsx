import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from 'react-router-dom';
import { useEffect } from 'react';
import { Provider, useApp } from './context';
import { StoreLayout, StaffLayout, RequireClient } from './components/layout';
import { Catalog, ProductDetail } from './pages/store';
import { Addresses, Checkout, PaymentPage } from './pages/checkout';
import { Orders } from './pages/orders';
import { Manage, StaffCreate } from './pages/manage';
import { CashPage, Pos, Sales } from './pages/operations';
import { Button } from './components/ui';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import './styles.css';
function Access() {
  const location = useLocation();
  const back = location.state?.volver;
  const { user, setOverlay } = useApp();
  if (user)
    return (
      <Navigate
        to={
          user.rol === 'CLIENTE'
            ? typeof back === 'string' &&
              back.startsWith('/') &&
              !back.startsWith('//')
              ? back
              : '/'
            : '/panel'
        }
        replace
      />
    );
  return (
    <main className="page result">
      <ShieldAlert size={44} />
      <h1>Tu cuenta te espera.</h1>
      <p className="muted">Inicia sesión para continuar.</p>
      <Button onClick={() => setOverlay({ type: 'auth' })}>
        Iniciar sesión
        <ArrowRight size={18} />
      </Button>
    </main>
  );
}
function PanelIndex() {
  const { user } = useApp();
  return <Navigate to={user?.rol === 'ADMIN' ? 'productos' : 'pos'} replace />;
}
function Missing({ denied = false }: { denied?: boolean }) {
  const { user } = useApp();
  return (
    <main className="page result missing">
      <span className="error-number">{denied ? '403' : '404'}</span>
      <h1>
        {denied
          ? 'Este espacio tiene otro acceso.'
          : 'Parece que tomaste otro camino.'}
      </h1>
      <p className="muted">
        {denied
          ? 'Tu cuenta no tiene permisos para esta sección.'
          : 'No encontramos la página que estás buscando.'}
      </p>
      <Link
        className="btn"
        to={user && user.rol !== 'CLIENTE' ? '/panel' : '/'}
      >
        {user && user.rol !== 'CLIENTE'
          ? 'Volver al panel'
          : 'Volver a la tienda'}
        <ArrowRight size={18} />
      </Link>
    </main>
  );
}
function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
function App() {
  return (
    <BrowserRouter>
      <Provider>
        <ScrollReset />
        <Routes>
          <Route element={<StoreLayout />}>
            <Route index element={<Catalog />} />
            <Route path="producto/:id" element={<ProductDetail />} />
            <Route path="acceso" element={<Access />} />
            <Route
              path="direcciones"
              element={
                <RequireClient>
                  <Addresses />
                </RequireClient>
              }
            />
            <Route
              path="checkout"
              element={
                <RequireClient>
                  <Checkout />
                </RequireClient>
              }
            />
            <Route
              path="pago/:id"
              element={
                <RequireClient>
                  <PaymentPage />
                </RequireClient>
              }
            />
            <Route
              path="pedidos"
              element={
                <RequireClient>
                  <Orders />
                </RequireClient>
              }
            />
            <Route path="403" element={<Missing denied />} />
            <Route path="*" element={<Missing />} />
          </Route>
          <Route path="panel" element={<StaffLayout />}>
            <Route index element={<PanelIndex />} />
            <Route path="productos" element={<Manage kind="productos" />} />
            <Route path="categorias" element={<Manage kind="categorias" />} />
            <Route path="personal" element={<StaffCreate />} />
            <Route path="pos" element={<Pos />} />
            <Route path="caja" element={<CashPage />} />
            <Route path="ventas" element={<Sales />} />
            <Route path="pedidos" element={<Orders staff />} />
          </Route>
        </Routes>
      </Provider>
    </BrowserRouter>
  );
}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
