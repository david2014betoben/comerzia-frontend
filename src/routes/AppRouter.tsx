import { Route, Routes } from "react-router-dom";
import { CatalogManager } from "../components/catalog/CatalogManager";
import { StaffLayout } from "../layouts/StaffLayout";
import { StoreLayout } from "../layouts/StoreLayout";
import { AddressesPage } from "../pages/account/AddressesPage";
import { AccessPage } from "../pages/auth/AccessPage";
import { CashPage } from "../pages/cash/CashPage";
import { CheckoutPage } from "../pages/checkout/CheckoutPage";
import { PaymentPage } from "../pages/checkout/PaymentPage";
import { ErrorPage } from "../pages/errors/ErrorPage";
import { OrdersPage } from "../pages/orders/OrdersPage";
import { PosPage } from "../pages/pos/PosPage";
import { SalesPage } from "../pages/sales/SalesPage";
import { CatalogPage } from "../pages/store/CatalogPage";
import { ProductDetailPage } from "../pages/store/ProductDetailPage";
import { CreateUserPage } from "../pages/users/CreateUserPage";
import { PanelRedirect } from "./PanelRedirect";
import { RequireClient } from "./ProtectedRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route index element={<CatalogPage />} />
        <Route path="producto/:id" element={<ProductDetailPage />} />
        <Route path="acceso" element={<AccessPage />} />
        <Route
          path="direcciones"
          element={
            <RequireClient>
              <AddressesPage />
            </RequireClient>
          }
        />
        <Route
          path="checkout"
          element={
            <RequireClient>
              <CheckoutPage />
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
              <OrdersPage />
            </RequireClient>
          }
        />
        <Route path="403" element={<ErrorPage denied />} />
        <Route path="*" element={<ErrorPage />} />
      </Route>
      <Route path="panel" element={<StaffLayout />}>
        <Route index element={<PanelRedirect />} />
        <Route path="productos" element={<CatalogManager kind="productos" />} />
        <Route
          path="categorias"
          element={<CatalogManager kind="categorias" />}
        />
        <Route path="personal" element={<CreateUserPage />} />
        <Route path="pos" element={<PosPage />} />
        <Route path="caja" element={<CashPage />} />
        <Route path="ventas" element={<SalesPage />} />
        <Route path="pedidos" element={<OrdersPage staff />} />
      </Route>
    </Routes>
  );
}
