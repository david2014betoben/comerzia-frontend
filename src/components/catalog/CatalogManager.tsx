import { Archive, Pencil, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { useApp } from "../../hooks/useApp";
import { categoriesService } from "../../services/categories.service";
import { productsService } from "../../services/products.service";
import type { CatalogRecord } from "../../types/catalog";
import type { CategoryInput } from "../../types/categories";
import type { ProductInput } from "../../types/products";
import { money } from "../../utils/formatters";
import { formText } from "../../utils/forms";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Empty } from "../ui/EmptyState";
import { ErrorBox } from "../ui/ErrorMessage";
import { Loading } from "../ui/LoadingState";
import { Modal } from "../ui/Modal";

export function CatalogManager({ kind }: { kind: "productos" | "categorias" }) {
  const { user, toast } = useApp();
  const product = kind === "productos";
  const r = useApi<CatalogRecord[]>(
    () =>
      product ? productsService.getForStaff() : categoriesService.getForStaff(),
    [kind],
  );
  const cats = useApi(() => categoriesService.getAll(), [kind]);
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [category, setCategory] = useState(""),
    [stock, setStock] = useState("");
  const [edit, setEdit] = useState<Partial<CatalogRecord> | null>(null),
    [remove, setRemove] = useState<CatalogRecord | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  if (user?.rol !== "ADMIN") return <Navigate to="/403" replace />;
  const active = (p: CatalogRecord) => (product ? p.activo : p.activa);
  const list = (r.data || []).filter(
    (p) =>
      `${p.nombre} ${p.sku || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!status || String(active(p)) === status) &&
      (!product || !category || p.categoriaId === Number(category)) &&
      (!product ||
        !stock ||
        (stock === "yes"
          ? (p.inventario?.stock || 0) > 0
          : !p.inventario?.stock)),
  );
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">GESTIÓN DEL CATÁLOGO</span>
          <h1>{product ? "Productos" : "Categorías"}</h1>
          <p className="muted">
            {product
              ? "Cada detalle de tu catálogo, bajo control."
              : "Organiza una mejor experiencia de compra."}
          </p>
        </div>
        <Button
          onClick={() => {
            setError("");
            setEdit({});
          }}
        >
          <Plus size={18} />
          {product ? "Nuevo producto" : "Nueva categoría"}
        </Button>
      </div>
      <div className="surface table-surface">
        <div className="toolbar">
          <div className="search-wrap">
            <Search size={18} />
            <input
              placeholder={
                product ? "Buscar por nombre o SKU…" : "Buscar categoría…"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            aria-label="Estado"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          {product && (
            <>
              <select
                aria-label="Categoría"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {cats.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <select
                aria-label="Disponibilidad"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              >
                <option value="">Todo el stock</option>
                <option value="yes">Con stock</option>
                <option value="no">Agotados</option>
              </select>
            </>
          )}
        </div>
        {r.loading ? (
          <Loading />
        ) : r.error ? (
          <ErrorBox error={r.error} retry={r.reload} />
        ) : !list.length ? (
          <Empty />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{product ? "Producto / SKU" : "Nombre"}</th>
                  {product ? (
                    <>
                      <th>Categoría</th>
                      <th>Costo</th>
                      <th>Precio</th>
                      <th>Stock</th>
                    </>
                  ) : (
                    <th>Descripción</th>
                  )}
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.nombre}</strong>
                      {product && <small>{p.sku}</small>}
                    </td>
                    {product ? (
                      <>
                        <td>{p.categoria?.nombre}</td>
                        <td>{money(p.costoCompra)}</td>
                        <td>
                          <b>{money(p.precioVenta)}</b>
                        </td>
                        <td>
                          <span
                            className={
                              !p.inventario?.stock ? "danger-text" : ""
                            }
                          >
                            {p.inventario?.stock ?? 0}
                          </span>
                        </td>
                      </>
                    ) : (
                      <td>{p.descripcion || "—"}</td>
                    )}
                    <td>
                      <Badge value={active(p) ? "ACTIVO" : "INACTIVO"} />
                    </td>
                    <td>
                      <div className="form-actions">
                        <button
                          className="icon"
                          title="Editar"
                          aria-label={`Editar ${p.nombre}`}
                          onClick={() => {
                            setError("");
                            setEdit(p);
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        {active(p) && (
                          <button
                            className="icon"
                            title="Desactivar"
                            aria-label={`Desactivar ${p.nombre}`}
                            onClick={() => {
                              setError("");
                              setRemove(p);
                            }}
                          >
                            <Archive size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-foot">{list.length} registros</div>
      </div>
      {edit && (
        <Modal
          title={`${edit.id ? "Editar" : product ? "Nuevo" : "Nueva"} ${product ? "producto" : "categoría"}`}
          onClose={() => setEdit(null)}
          busy={busy}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const body: Partial<ProductInput> & CategoryInput = {
                nombre: formText(f, "nombre"),
                descripcion: formText(f, "descripcion") || undefined,
              };
              if (product)
                Object.assign(body, {
                  sku: formText(f, "sku"),
                  categoriaId: Number(formText(f, "categoriaId")),
                  costoCompra: Number(formText(f, "costoCompra")),
                  precioVenta: Number(formText(f, "precioVenta")),
                  stock: Number(formText(f, "stock")),
                });
              setBusy(true);
              setError("");
              try {
                await (product
                  ? edit.id
                    ? productsService.update(edit.id, body as ProductInput)
                    : productsService.create(body as ProductInput)
                  : edit.id
                    ? categoriesService.update(edit.id, body)
                    : categoriesService.create(body));
                setEdit(null);
                r.reload();
                cats.reload();
                toast("Cambios guardados");
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {product && (
              <label>
                SKU
                <input
                  name="sku"
                  required
                  maxLength={50}
                  defaultValue={edit.sku}
                />
              </label>
            )}
            <label>
              Nombre
              <input
                name="nombre"
                required
                maxLength={product ? 120 : 80}
                defaultValue={edit.nombre}
              />
            </label>
            <label>
              Descripción
              <textarea
                name="descripcion"
                rows={3}
                defaultValue={edit.descripcion}
              />
            </label>
            {product && (
              <>
                <label>
                  Categoría
                  <select
                    name="categoriaId"
                    required
                    defaultValue={edit.categoriaId ?? ""}
                  >
                    <option value="" disabled>
                      Selecciona una categoría
                    </option>
                    {cats.data?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="form-grid">
                  {[
                    ["costoCompra", "Costo de compra", edit.costoCompra],
                    ["precioVenta", "Precio de venta", edit.precioVenta],
                    ["stock", "Stock", edit.inventario?.stock],
                  ].map(([k, t, v]) => (
                    <label key={k}>
                      {t}
                      <input
                        name={String(k)}
                        type="number"
                        min="0"
                        step={k === "stock" ? "1" : "0.01"}
                        required
                        defaultValue={v ?? 0}
                      />
                    </label>
                  ))}
                </div>
              </>
            )}
            {error && <ErrorBox error={error} />}
            <div className="form-actions">
              <Button
                className="secondary"
                type="button"
                disabled={busy}
                onClick={() => setEdit(null)}
              >
                Cancelar
              </Button>
              <Button busy={busy}>Guardar cambios</Button>
            </div>
          </form>
        </Modal>
      )}
      {remove && (
        <Modal
          title={`¿Desactivar ${product ? "este producto" : "esta categoría"}?`}
          busy={busy}
          onClose={() => setRemove(null)}
        >
          <h3>{remove.nombre}</h3>
          <p className="muted">
            El registro y su historial se conservarán.{" "}
            {product
              ? "Dejará de estar disponible para nuevas compras."
              : "No se desactivarán automáticamente sus productos."}
          </p>
          {error && <ErrorBox error={error} />}
          <div className="form-actions">
            <Button
              className="secondary"
              disabled={busy}
              onClick={() => setRemove(null)}
            >
              Cancelar
            </Button>
            <Button
              className="destructive"
              busy={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await (product
                    ? productsService.deactivate(remove.id)
                    : categoriesService.deactivate(remove.id));
                  setRemove(null);
                  r.reload();
                  cats.reload();
                  toast("Registro desactivado");
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Desactivar
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
