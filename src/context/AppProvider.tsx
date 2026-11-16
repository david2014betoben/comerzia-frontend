import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "../components/auth/AuthModal";
import { CartDrawer } from "../components/cart/CartDrawer";
import { QuickProductModal } from "../components/products/QuickProductModal";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";
import type { Overlay } from "../types/app";
import type { Product } from "../types/products";
import { AppContext } from "./AppContext";
export function AppProvider({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const auth = useAuth();
  const { message, toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { cart, refreshCart, addItem, clearCart } = useCart(auth.user, toast);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [pending, setPending] = useState<{ p: Product; q: number } | null>(
    null,
  );
  const logout = () => {
    auth.logout();
    clearCart();
    setOverlay(null);
    setPending(null);
    nav("/");
  };
  useEffect(() => {
    const expired = () => {
      clearCart();
      setOverlay({ type: "auth" });
      toast("Tu sesión venció. Inicia sesión de nuevo.");
    };
    window.addEventListener("comerzia:expired", expired);
    return () => window.removeEventListener("comerzia:expired", expired);
  }, []);
  const add = async (p: Product, q = 1) => {
    if (!auth.user) {
      setPending({ p, q });
      setOverlay({ type: "auth" });
      return;
    }
    if (auth.user.rol !== "CLIENTE") {
      toast(
        "Para comprar online utiliza una cuenta de cliente. Para vender, entra al punto de venta.",
      );
      return;
    }
    await addItem({ productoId: p.id, cantidad: q });
    setOverlay({ type: "cart" });
  };
  const login = async (email: string, password: string) => {
    const user = await auth.login({ email, password });
    setOverlay(null);
    if (pending && user.rol === "CLIENTE") {
      await addItem({ productoId: pending.p.id, cantidad: pending.q }, user.id);
      setPending(null);
      setOverlay({ type: "cart" });
    } else if (user.rol !== "CLIENTE")
      nav("/panel/" + (user.rol === "ADMIN" ? "productos" : "pos"));
  };
  return (
    <AppContext.Provider
      value={{
        user: auth.user,
        cart,
        overlay,
        setOverlay,
        logout,
        refreshCart,
        add,
        toast,
        theme,
        toggleTheme,
      }}
    >
      {children}
      {message && (
        <div className="toast" role="status">
          {message}
          <button aria-label="Cerrar aviso" onClick={() => toast("")}>
            ×
          </button>
        </div>
      )}
      {overlay?.type === "auth" && (
        <AuthModal
          key={overlay.register ? "register" : "login"}
          register={overlay.register}
          login={login}
        />
      )}
      {overlay?.type === "cart" && <CartDrawer />}
      {overlay?.type === "product" && (
        <QuickProductModal product={overlay.product} />
      )}
    </AppContext.Provider>
  );
}
