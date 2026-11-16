import { ArrowRight, CheckCircle2, Plus, Wallet } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { OpenCashModal } from "../../components/cash/OpenCashModal";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Empty } from "../../components/ui/EmptyState";
import { ErrorBox } from "../../components/ui/ErrorMessage";
import { Loading } from "../../components/ui/LoadingState";
import { Modal } from "../../components/ui/Modal";
import { useApi } from "../../hooks/useApi";
import { useApp } from "../../hooks/useApp";
import { cashService } from "../../services/cash.service";
import type { CashClosing } from "../../types/cash";
import { date, money } from "../../utils/formatters";
import { formText } from "../../utils/forms";

export function CashPage() {
  const { user, toast } = useApp();
  const r = useApi(() => cashService.getCurrent());
  const [open, setOpen] = useState(false),
    [close, setClose] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [result, setResult] = useState<CashClosing | null>(null);
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">CONTROL DE EFECTIVO</span>
          <h1>{user?.rol === "ADMIN" ? "Caja" : "Mi caja"}</h1>
          <p className="muted">Comienza tu sesión con todo en orden.</p>
        </div>
        {user?.rol === "ADMIN" && (
          <Button
            className="secondary"
            onClick={() => {
              setError("");
              setResult(null);
              setClose(true);
            }}
          >
            Cerrar una sesión
          </Button>
        )}
      </div>
      {r.loading ? (
        <Loading />
      ) : r.error ? (
        <ErrorBox error={r.error} retry={r.reload} />
      ) : r.data ? (
        <section className="surface cash-card">
          <div className="between">
            <Wallet size={36} />
            <Badge value="ABIERTA" />
          </div>
          <h2>Sesión #{r.data.id}</h2>
          <p className="muted">
            {user?.nombre}
            <br />
            Apertura: {date(r.data.abiertaEn)}
          </p>
          <small>Monto inicial</small>
          <h1>{money(r.data.montoInicial)}</h1>
          <Link className="btn" to="/panel/pos">
            Ir al punto de venta
            <ArrowRight size={18} />
          </Link>
          {user?.rol === "CAJERO" && (
            <p className="fine-print">El cierre lo realiza un administrador.</p>
          )}
        </section>
      ) : (
        <Empty title="Tu caja aún no está abierta">
          <p>Registra el efectivo inicial para comenzar.</p>
          <Button onClick={() => setOpen(true)}>
            <Plus size={18} />
            Abrir caja
          </Button>
        </Empty>
      )}
      {open && (
        <OpenCashModal
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            r.reload();
            toast("Caja abierta");
          }}
        />
      )}
      {close && (
        <Modal
          title={result ? "Resumen del cierre" : "Cerrar sesión de caja"}
          onClose={() => setClose(false)}
          busy={busy}
        >
          {result ? (
            <>
              <div className="result">
                <CheckCircle2 size={42} />
                <h2>
                  {Number(result.diferencia) === 0
                    ? "Caja cuadrada"
                    : Number(result.diferencia) > 0
                      ? "Sobrante"
                      : "Faltante"}
                </h2>
              </div>
              {[
                ["sesionId", "Sesión"],
                ["ventasTotalesPOS", "Ventas totales POS"],
                ["ventasEnEfectivo", "Ventas en efectivo"],
                ["efectivoEsperado", "Efectivo esperado"],
                ["efectivoContado", "Efectivo contado"],
                ["diferencia", "Diferencia"],
              ].map(([k, t]) => (
                <div className="summary-row" key={k}>
                  <span>{t}</span>
                  <b>
                    {k === "sesionId"
                      ? result[k as keyof CashClosing]
                      : money(result[k as keyof CashClosing])}
                  </b>
                </div>
              ))}
              <Button className="full" onClick={() => setClose(false)}>
                Cerrar resumen
              </Button>
            </>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                if (formText(f, "confirm") !== "on") return;
                setBusy(true);
                setError("");
                try {
                  const v = await cashService.close(
                    Number(formText(f, "sesionId")),
                    Number(formText(f, "efectivoContado")),
                  );
                  setResult(v);
                  r.reload();
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label>
                ID de sesión
                <input
                  name="sesionId"
                  type="number"
                  min="1"
                  step="1"
                  required
                  defaultValue={r.data?.id}
                />
              </label>
              <label>
                Efectivo contado (USD)
                <input
                  name="efectivoContado"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
              </label>
              <label className="check-label">
                <input name="confirm" type="checkbox" required />
                Confirmo que el conteo está completo.
              </label>
              <div className="alert">
                El cierre es definitivo. El resumen se calculará al confirmar.
              </div>
              {error && <ErrorBox error={error} />}
              <Button busy={busy} className="full">
                Confirmar cierre
              </Button>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
