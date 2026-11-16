import { Plus } from "lucide-react";
import { useState } from "react";
import { AddressCard } from "../../components/addresses/AddressCard";
import { AddressForm } from "../../components/addresses/AddressForm";
import { Button } from "../../components/ui/Button";
import { Empty } from "../../components/ui/EmptyState";
import { ErrorBox } from "../../components/ui/ErrorMessage";
import { Loading } from "../../components/ui/LoadingState";
import { useApi } from "../../hooks/useApi";
import { addressesService } from "../../services/addresses.service";

export function AddressesPage() {
  const r = useApi(() => addressesService.getAll());
  const [open, setOpen] = useState(false);
  return (
    <main className="page store-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">TU CUENTA</span>
          <h1>Mis direcciones</h1>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={18} />
          Agregar dirección
        </Button>
      </div>
      {r.loading ? (
        <Loading />
      ) : r.error ? (
        <ErrorBox error={r.error} retry={r.reload} />
      ) : !r.data?.length ? (
        <Empty title="¿A dónde enviamos tu próxima compra?">
          <Button onClick={() => setOpen(true)}>Agregar dirección</Button>
        </Empty>
      ) : (
        <div className="address-grid">
          {r.data.map((a) => (
            <AddressCard key={a.id} a={a} />
          ))}
        </div>
      )}
      {open && (
        <AddressForm
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            r.reload();
          }}
        />
      )}
    </main>
  );
}
