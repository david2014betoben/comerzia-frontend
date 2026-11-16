import { AlertTriangle, CheckCircle2, CreditCard } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LineItems } from "../../components/products/LineItems";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Empty } from "../../components/ui/EmptyState";
import { ErrorBox } from "../../components/ui/ErrorMessage";
import { Loading } from "../../components/ui/LoadingState";
import { Modal } from "../../components/ui/Modal";
import { useApi } from "../../hooks/useApi";
import { useApp } from "../../hooks/useApp";
import { ordersService } from "../../services/orders.service";
import { paymentsService } from "../../services/payments.service";
import { money } from "../../utils/formatters";
import { formText } from "../../utils/forms";

export function PaymentPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const r = useApi(() => ordersService.getMine(), [id]);
  const order = r.data?.find((o) => o.id === Number(id));
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [result, setResult] = useState<string | null>(null),
    [uncertain, setUncertain] = useState(false);
  const { toast } = useApp();
  const pay = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    setError("");
    try {
      const v = await paymentsService.simulate(
        Number(id),
        formText(f, "numeroTarjeta"),
      );
      form.reset();
      setResult(v.pagoEstado === "APROBADO" ? "PAGADO" : "CANCELADO");
      r.reload();
    } catch (e) {
      form.reset();
      setError((e as Error).message);
      if ((e as { status?: number }).status === 0) setUncertain(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="page store-page">
      <span className="eyebrow">COMERZIA SANDBOX</span>
      <h1>Prueba tu pago.</h1>
      <div className="steps">
        <span>01 Dirección</span>
        <span>—</span>
        <span>02 Revisión</span>
        <span>—</span>
        <b>03 Pago</b>
      </div>
      {r.loading ? (
        <Loading />
      ) : r.error ? (
        <ErrorBox error={r.error} retry={r.reload} />
      ) : !order ? (
        <Empty title="No encontramos ese pedido">
          <Link className="btn" to="/pedidos">
            Mis pedidos
          </Link>
        </Empty>
      ) : (
        <div className="checkout-grid">
          <section className="surface">
            <div className="alert">
              <AlertTriangle size={23} />
              <span>
                <b>Simulación de pago</b>
                <br />
                No se realizarán cobros. Usa únicamente datos inventados.
              </span>
            </div>
            {order.estado !== "PENDIENTE" ? (
              <div className="result">
                <CheckCircle2 size={42} />
                <h2>
                  Pedido {order.estado === "CANCELADO" ? "cancelado" : "pagado"}
                </h2>
                <Badge value={order.estado} />
                <p>Consulta el detalle en Mis pedidos.</p>
                <Link className="btn" to="/pedidos">
                  Ver mis pedidos
                </Link>
              </div>
            ) : uncertain ? (
              <div className="result">
                <AlertTriangle size={42} />
                <h2>No pudimos confirmar el resultado</h2>
                <p>Consulta tus pedidos antes de intentar otra operación.</p>
                <Link className="btn" to="/pedidos">
                  Consultar mis pedidos
                </Link>
              </div>
            ) : (
              <>
                <div className="credit-card">
                  <span>
                    COMERZIA <small>DEMO</small>
                  </span>
                  <CreditCard size={32} />
                  <strong>•••• &nbsp; •••• &nbsp; •••• &nbsp; 4040</strong>
                  <span>SOLO DATOS INVENTADOS</span>
                </div>
                <form autoComplete="off" onSubmit={pay}>
                  <fieldset disabled={busy}>
                    <label>
                      Titular <small>ilustrativo</small>
                      <input
                        name="titular"
                        placeholder="Nombre inventado"
                        autoComplete="off"
                      />
                    </label>
                    <label>
                      Número de tarjeta ficticia
                      <input
                        name="numeroTarjeta"
                        required
                        inputMode="numeric"
                        maxLength={32}
                        pattern="[0-9][0-9 -]*"
                        placeholder="4040 1234 5678 9012"
                        autoComplete="off"
                      />
                    </label>
                    <div className="form-grid">
                      <label>
                        Vencimiento <small>ilustrativo</small>
                        <input
                          name="vencimiento"
                          placeholder="MM/AA"
                          maxLength={5}
                          autoComplete="off"
                        />
                      </label>
                      <label>
                        CVV <small>ilustrativo</small>
                        <input
                          name="cvv"
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="•••"
                          autoComplete="off"
                        />
                      </label>
                    </div>
                    <p className="fine-print">
                      Prefijo <b>4040</b>: aprobado. Otros prefijos: rechazado.
                      Los demás campos no determinan la aprobación.
                    </p>
                    {error && <ErrorBox error={error} />}
                    <Button className="full" busy={busy}>
                      {busy ? "Procesando simulación…" : "Simular pago"}
                    </Button>
                  </fieldset>
                </form>
              </>
            )}
          </section>
          <aside className="surface order-summary">
            <div className="between">
              <h2>Pedido #{order.id}</h2>
              <Badge value={order.estado} />
            </div>
            <LineItems lines={order.detalles} />
            <div className="summary-total">
              <span>Total</span>
              <strong>{money(order.totalProductos)}</strong>
            </div>
            <p className="muted">
              {order.destinatario}
              <br />
              {order.direccionDestino}
              <br />
              {order.ciudadDestino}
            </p>
          </aside>
        </div>
      )}
      {result && (
        <Modal
          title={
            result === "PAGADO"
              ? "Pago de prueba aprobado"
              : "Pago de prueba rechazado"
          }
          onClose={() => setResult(null)}
        >
          <div className="result">
            {result === "PAGADO" ? (
              <CheckCircle2 size={54} className="lime-text" />
            ) : (
              <AlertTriangle size={54} />
            )}
            <h2>
              {result === "PAGADO"
                ? "Tu pedido ya está pagado"
                : "Tu pedido fue cancelado"}
            </h2>
            <p>
              {result === "PAGADO"
                ? "La simulación se completó correctamente."
                : "El stock reservado volvió al inventario."}
            </p>
            <p>
              Pedido #{id} · {money(order?.totalProductos)}
            </p>
            <Badge value={result} />
            <Button
              className="full"
              onClick={() => {
                setResult(null);
                nav("/pedidos");
              }}
            >
              Ver mis pedidos
            </Button>
            <button
              className="link"
              onClick={() => {
                toast("Gracias por probar Comerzia");
                nav("/");
              }}
            >
              Seguir comprando
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
