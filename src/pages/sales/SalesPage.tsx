import { ArrowRight, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { LineItems } from "../../components/products/LineItems";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Empty } from "../../components/ui/EmptyState";
import { ErrorBox } from "../../components/ui/ErrorMessage";
import { Loading } from "../../components/ui/LoadingState";
import { Modal } from "../../components/ui/Modal";
import { useApi } from "../../hooks/useApi";
import { useApp } from "../../hooks/useApp";
import { posService } from "../../services/pos.service";
import type { Sale } from "../../types/sales";
import { date, label, money, today } from "../../utils/formatters";

export function SalesPage() {
  const { user } = useApp();
  const [day, setDay] = useState(today());
  const r = useApi(() => posService.getByDate(day), [day]);
  const [selected, setSelected] = useState<Sale | null>(null);
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">HISTORIAL POS</span>
          <h1>{user?.rol === "CAJERO" ? "Mis ventas" : "Ventas"}</h1>
          <p className="muted">Consulta tus comprobantes y cobros.</p>
        </div>
        <Link className="btn" to="/panel/pos">
          Punto de venta
          <ArrowRight size={17} />
        </Link>
      </div>
      <div className="surface table-surface">
        <div className="toolbar">
          <label>
            Fecha
            <input
              type="date"
              value={day}
              onChange={(e) => {
                if (e.target.value) setDay(e.target.value);
              }}
            />
          </label>
          <Button className="secondary" onClick={r.reload}>
            <RefreshCw size={16} />
            Actualizar
          </Button>
        </div>
        {r.loading ? (
          <Loading />
        ) : r.error ? (
          <ErrorBox error={r.error} retry={r.reload} />
        ) : !r.data?.length ? (
          <Empty title="Sin ventas en esta fecha" />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Comprobante</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Método</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {r.data.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.numeroComprobante}</strong>
                    </td>
                    <td>{date(s.createdAt)}</td>
                    <td>
                      <Badge value={s.estado} />
                    </td>
                    <td>
                      {s.metodoPago
                        ? label(s.metodoPago)
                        : "Pendiente de cobro"}
                    </td>
                    <td>
                      <b>{money(s.total)}</b>
                    </td>
                    <td>
                      <Button
                        className="secondary"
                        onClick={() => setSelected(s)}
                      >
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selected && (
        <Modal
          title={selected.numeroComprobante}
          drawer
          onClose={() => setSelected(null)}
        >
          <div className="between">
            <small>{date(selected.createdAt)}</small>
            <Badge value={selected.estado} />
          </div>
          <LineItems lines={selected.detalles} />
          <div className="summary-total">
            <span>Total</span>
            <strong>{money(selected.total)}</strong>
          </div>
          <p className="muted">
            {selected.metodoPago
              ? label(selected.metodoPago)
              : "Pendiente de cobro"}
          </p>
        </Modal>
      )}
    </>
  );
}
