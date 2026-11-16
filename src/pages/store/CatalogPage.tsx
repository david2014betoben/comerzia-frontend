import {
  ArrowRight,
  ArrowUpRight,
  Package,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import images from "../../assets/design-images.json";
import { ProductCard } from "../../components/products/ProductCard";
import { Button } from "../../components/ui/Button";
import { Empty } from "../../components/ui/EmptyState";
import { ErrorBox } from "../../components/ui/ErrorMessage";
import { Loading } from "../../components/ui/LoadingState";
import { useApi } from "../../hooks/useApi";
import { categoriesService } from "../../services/categories.service";
import { productsService } from "../../services/products.service";
import { money } from "../../utils/formatters";

export function CatalogPage() {
  const { data, loading, error, reload } = useApi(() =>
    Promise.all([productsService.getAll(), categoriesService.getAll()]),
  );
  const [params] = useSearchParams();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState(0),
    [sort, setSort] = useState("name"),
    [focus, setFocus] = useState(false);
  useEffect(() => {
    if (params.has("buscar")) {
      input.current?.focus();
      document.getElementById("catalogo")?.scrollIntoView();
    }
  }, [params]);
  const products = data?.[0] || [];
  const filtered = products
    .filter(
      (p) =>
        (!category || p.categoria?.id === category) &&
        `${p.nombre} ${p.sku}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "price"
        ? Number(a.precioVenta) - Number(b.precioVenta)
        : sort === "priceDesc"
          ? Number(b.precioVenta) - Number(a.precioVenta)
          : a.nombre.localeCompare(b.nombre),
    );
  return (
    <main className="store-main">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" /> DISEÑO QUE ACOMPAÑA TU DÍA
          </div>
          <h1>
            Tu próximo
            <br />
            favorito está <em>aquí.</em>
          </h1>
          <p>
            Encuentra tecnología y objetos que hacen de lo cotidiano algo
            especial.
          </p>
          <a className="btn lime" href="#catalogo">
            Explorar productos
            <ArrowUpRight size={20} />
          </a>
          <div className="hero-caption">
            <span>01 / COMERZIA</span>
            <span>Una nueva forma de elegir.</span>
          </div>
        </div>
        <div className="hero-image">
          <img
            src={images[0]?.src}
            alt="Selección editorial de tecnología y accesorios en tonos oscuros"
          />
          <div className="hero-image-note">
            <span>OBJETOS CON PROPÓSITO</span>
            <ArrowUpRight />
          </div>
        </div>
      </section>
      <section id="catalogo" className="catalog-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">EXPLORA LA COLECCIÓN</span>
            <h2>Hechos para tu día.</h2>
          </div>
          <span className="muted">{filtered.length} productos</span>
        </div>
        <div className="catalog-tools">
          <div className="search-wrap">
            <Search size={19} />
            <input
              ref={input}
              placeholder="Buscar por nombre o SKU…"
              value={query}
              onFocus={() => setFocus(true)}
              onBlur={() => setTimeout(() => setFocus(false), 150)}
              onKeyDown={(e) => e.key === "Escape" && setFocus(false)}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                aria-label="Limpiar búsqueda"
                onClick={() => setQuery("")}
              >
                ×
              </button>
            )}
            {focus && query && (
              <div className="search-results">
                {filtered.slice(0, 4).map((p) => (
                  <Link key={p.id} to={`/producto/${p.id}`}>
                    <Package size={18} />
                    <span>{p.nombre}</span>
                    <b>{money(p.precioVenta)}</b>
                  </Link>
                ))}
                {!filtered.length && <p>No encontramos coincidencias.</p>}
              </div>
            )}
          </div>
          <label className="sort">
            <SlidersHorizontal size={17} />
            <select
              aria-label="Ordenar productos"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="name">Nombre: A–Z</option>
              <option value="price">Menor precio</option>
              <option value="priceDesc">Mayor precio</option>
            </select>
          </label>
        </div>
        <div className="chips">
          <button
            className={!category ? "active" : ""}
            onClick={() => setCategory(0)}
          >
            Todos los productos
          </button>
          {data?.[1].map((c) => (
            <button
              className={category === c.id ? "active" : ""}
              key={c.id}
              onClick={() => setCategory(c.id)}
            >
              {c.nombre}
            </button>
          ))}
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorBox error={error} retry={reload} />
        ) : !filtered.length ? (
          <Empty title="No encontramos productos">
            <Button
              onClick={() => {
                setQuery("");
                setCategory(0);
              }}
            >
              Limpiar filtros
            </Button>
          </Empty>
        ) : (
          <div className="product-grid">
            {filtered.map((p) => (
              <ProductCard p={p} key={p.id} />
            ))}
          </div>
        )}
      </section>
      <section className="editorial-note">
        <span className="eyebrow">MENOS RUIDO. MEJORES ELECCIONES.</span>
        <h2>
          Pequeños detalles.
          <br />
          <span className="muted">Grandes diferencias.</span>
        </h2>
        <a
          href="#catalogo"
          className="round-arrow"
          aria-label="Volver al catálogo"
        >
          <ArrowRight />
        </a>
      </section>
    </main>
  );
}
