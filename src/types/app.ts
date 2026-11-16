import type { Cart } from "./cart";
import type { Product } from "./products";
import type { User } from "./users";
export type Overlay =
  | { type: "auth"; register?: boolean }
  | { type: "cart" }
  | { type: "product"; product: Product }
  | null;
export type AppContextValue = {
  user: User | null;
  cart: Cart | null;
  overlay: Overlay;
  setOverlay: (value: Overlay) => void;
  logout: () => void;
  refreshCart: () => Promise<void>;
  add: (product: Product, quantity?: number) => Promise<void>;
  toast: (message: string) => void;
  theme: string;
  toggleTheme: () => void;
};
