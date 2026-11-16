import { PackageOpen } from "lucide-react";
import type { Line } from "../../types/cart";
import { money } from "../../utils/formatters";

export function LineItems({ lines }: { lines: Line[] }) {
  return (
    <div>
      {lines.map((l, i) => (
        <div className="line" key={l.id ?? i}>
          <div className="mini-art">
            <PackageOpen size={24} />
          </div>
          <div className="grow">
            <strong>{l.producto.nombre}</strong>
            <small>
              {l.cantidad} × {money(l.precioUnitario ?? l.producto.precioVenta)}
            </small>
          </div>
          <b>
            {money(
              l.subtotal ??
                Number(l.precioUnitario ?? l.producto.precioVenta) * l.cantidad,
            )}
          </b>
        </div>
      ))}
    </div>
  );
}
