import type { Line } from "../types/cart";
export const money = (n: unknown) =>
  new Intl.NumberFormat("es-BO", { style: "currency", currency: "USD" }).format(
    Number(n || 0),
  );
export const date = (s: string) =>
  new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/La_Paz",
  }).format(new Date(s));
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const total = (lines: Line[]) =>
  lines.reduce(
    (s, l) =>
      s +
      Math.round(Number(l.precioUnitario ?? l.producto.precioVenta) * 100) *
        l.cantidad,
    0,
  ) / 100;
export const label = (s: string) => s.replaceAll("_", " ");
