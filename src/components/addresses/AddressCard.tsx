import { MapPin } from "lucide-react";
import type { Address } from "../../types/addresses";

export function AddressCard({
  a,
  selected,
  onSelect,
}: {
  a: Address;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      className={`address-card ${selected ? "selected" : ""}`}
      onClick={onSelect}
      disabled={!onSelect}
    >
      <div className="between">
        <strong>
          <MapPin size={17} />
          {a.alias}
        </strong>
        {a.esPrincipal && <span className="badge">Principal</span>}
      </div>
      <b>{a.destinatario}</b>
      <p>
        {a.direccion}
        <br />
        {a.ciudad} · {a.telefono}
      </p>
      {a.referencias && <small>{a.referencias}</small>}
      {onSelect && (
        <span
          className="radio"
          aria-label={selected ? "Seleccionada" : "Seleccionar"}
        >
          {selected ? "●" : "○"}
        </span>
      )}
    </button>
  );
}
