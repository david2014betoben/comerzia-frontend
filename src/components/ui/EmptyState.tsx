import { PackageOpen } from "lucide-react";
import { type ReactNode } from "react";

export function Empty({
  title = "No hay resultados",
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <PackageOpen size={40} />
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}
