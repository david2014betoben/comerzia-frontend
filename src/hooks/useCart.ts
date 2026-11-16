import { useCallback, useEffect, useRef, useState } from "react";
import { cartService } from "../services/cart.service";
import type { AddItemInput, Cart } from "../types/cart";
import type { User } from "../types/users";
export function useCart(user: User | null, onError: (message: string) => void) {
  const [cart, setCart] = useState<Cart | null>(null);
  const userId = useRef(user?.id);
  userId.current = user?.id;
  const refreshCart = useCallback(async () => {
    if (user?.rol !== "CLIENTE") return;
    const id = user.id;
    const next = await cartService.getActive();
    if (userId.current === id) setCart(next);
  }, [user?.id, user?.rol]);
  useEffect(() => {
    if (user?.rol === "CLIENTE")
      refreshCart().catch((e) => onError((e as Error).message));
    else setCart(null);
  }, [refreshCart, onError, user?.rol]);
  const addItem = async (
    data: AddItemInput,
    expectedUserId = userId.current,
  ) => {
    const id = expectedUserId;
    const next = await cartService.addItem(data);
    if (userId.current === id) setCart(next);
  };
  return { cart, refreshCart, addItem, clearCart: () => setCart(null) };
}
