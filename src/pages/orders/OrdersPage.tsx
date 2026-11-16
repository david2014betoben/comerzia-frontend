import { ArrowRight, Package, Plus, RefreshCw, Truck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { OrderDetailDrawer } from "../../components/orders/OrderDetailDrawer";
import { SocialOrderModal } from "../../components/orders/SocialOrderModal";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Empty } from "../../components/ui/EmptyState";
import { ErrorBox } from "../../components/ui/ErrorMessage";
import { Loading } from "../../components/ui/LoadingState";
import { useApi } from "../../hooks/useApi";
import { ordersService } from "../../services/orders.service";
import type { Order } from "../../types/orders";
import { date, label, money } from "../../utils/formatters";

export function OrdersPage({ staff = false }: { staff?: boolean }) {
  const r = useApi(
    () => (staff ? ordersService.getQueue() : ordersService.getMine()),
    [staff],
  );
  const [status, setStatus] = useState(""),
    [origin, setOrigin] = useState(""),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<Order | null>(null),
    [social, setSocial] = useState(false);
  const list = (r.data || []).filter(
    (o) =>
      (!status || o.estado === status) &&
      (!origin || o.origen === origin) &&
      `${o.id} ${o.destinatario}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main className={staff ? "" : "page store-page"}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">{staff ? "OPERACIONES" : "TU CUENTA"}</span>
          <h1>{staff ? "Pedidos" : "Mis pedidos"}</h1>
          <p className="muted">
            {staff
              ? "Gestiona los pedidos pendientes de entrega."
              : "Cada compra, en un solo lugar."}
          </p>
        </div>
        <div className="form-actions">
          <Button className="secondary" onClick={r.reload}>
            <RefreshCw size={16} />
            Actualizar
          </Button>
          {staff ? (
            <Button onClick={() => setSocial(true)}>
              <Plus size={17} />
              Nuevo pedido de redes
            </Button>
          ) : (
            <Link className="link" to="/">
              Seguir explorando
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
      <div className="toolbar">
        <div className="chips">
          {[
            "",
            "PENDIENTE",
            "PAGADO",
            "EN_CAMINO",
            ...(!staff ? ["ENTREGADO", "CANCELADO"] : []),
          ].map((s) => (
            <button
              key={s}
              className={status === s ? "active" : ""}
              onClick={() => setStatus(s)}
            >
              {s ? label(s) : "Todos"}
            </button>
          ))}
        </div>
        {staff && (
          <>
            <select
              aria-label="Origen"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            >
              <option value="">Todos los orígenes</option>
              <option value="WEB">Web</option>
              <option value="REDES_SOCIALES">Redes sociales</option>
            </select>
            <input
              placeholder="Buscar pedido o destinatario…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </>
        )}
      </div>
      {r.loading ? (
        <Loading />
      ) : r.error ? (
        <ErrorBox error={r.error} retry={r.reload} />
      ) : !list.length ? (
        <Empty
          title={
            staff
              ? "No hay pedidos en esta cola"
              : "Todavía no hay pedidos aquí"
          }
        >
          {!staff && (
            <Link className="btn" to="/">
              Explorar productos
            </Link>
          )}
        </Empty>
      ) : (
        <div className="order-list">
          {list.map((o) => (
            <article className="order-row" key={o.id}>
              <div className="order-symbol">
                {o.estado === "EN_CAMINO" ? <Truck /> : <Package />}
              </div>
              <div>
                <strong>Pedido #{o.id}</strong>
                <small>{date(o.createdAt)}</small>
              </div>
              <div className="grow">
                <strong>{o.destinatario}</strong>
                <small>
                  {staff
                    ? label(o.origen)
                    : `${o.detalles.reduce((s, l) => s + l.cantidad, 0)} unidades`}
                </small>
              </div>
              <Badge value={o.estado} />
              <b>{money(o.totalProductos)}</b>
              <Button className="secondary" onClick={() => setSelected(o)}>
                Ver detalle
                <ArrowRight size={15} />
              </Button>
            </article>
          ))}
        </div>
      )}
      {selected && (
        <OrderDetailDrawer
          o={selected}
          staff={staff}
          onClose={() => setSelected(null)}
          onChanged={r.reload}
        />
      )}
      {social && (
        <SocialOrderModal
          onClose={() => setSocial(false)}
          onSaved={() => {
            setSocial(false);
            r.reload();
          }}
        />
      )}
    </main>
  );
}
