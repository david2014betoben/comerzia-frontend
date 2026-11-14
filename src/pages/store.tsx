import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  Plus,
  Package,
  SlidersHorizontal,
  Eye,
} from 'lucide-react';
import { api } from '../api';
import { useApp } from '../context';
import type { Product, Category } from '../types';
import { money } from '../utils';
import {
  Button,
  Loading,
  ErrorBox,
  Empty,
  useLoad,
  Quantity,
} from '../components/ui';
import images from '../design-images.json';
export function productImage(p: Product) {
  const n = p.nombre.toLowerCase();
  const pairs: [RegExp, number][] = [
    [/auricular|aud[ií]fono|headphone/, 1],
    [/teclado/, 2],
    [/mouse|rat[oó]n/, 3],
    [/l[aá]mpara|luminaria/, 4],
    [/mochila/, 5],
    [/organizador/, 6],
    [/botella|termo/, 7],
    [/soporte/, 8],
  ];
  return images[pairs.find(([re]) => re.test(n))?.[1] ?? -1]?.src;
}
export function ProductArt({ product: p }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const src = productImage(p);
  return src && !failed ? (
    <img
      src={src}
      alt={p.nombre}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <div className="product-placeholder">
      <Package size={80} strokeWidth={0.7} />
    </div>
  );
}
function ProductCard({ p }: { p: Product }) {
  const { setOverlay, add, toast } = useApp();
  const [busy, setBusy] = useState(false);
  return (
    <article className="product-card">
      <div className="product-photo">
        <Link to={`/producto/${p.id}`} aria-label={`Ver ${p.nombre}`}>
          <ProductArt product={p} />
        </Link>
        <button
          className="quick-btn"
          onClick={() => setOverlay({ type: 'product', product: p })}
        >
          <Eye size={16} />
          Vista rápida
        </button>
        <span className="photo-tag">{p.categoria?.nombre}</span>
      </div>
      <div className="product-meta">
        <small>{p.sku}</small>
        <Link to={`/producto/${p.id}`}>
          <h3>{p.nombre}</h3>
        </Link>
        <div className="between">
          <b>{money(p.precioVenta)}</b>
          <Button
            className="add-btn"
            busy={busy}
            aria-label={`Agregar ${p.nombre}`}
            onClick={async () => {
              setBusy(true);
              try {
                await add(p);
              } catch (e) {
                toast((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Plus size={19} />
          </Button>
        </div>
      </div>
    </article>
  );
}
export function Catalog() {
  const { data, loading, error, reload } = useLoad(() =>
    Promise.all([api<Product[]>('/products'), api<Category[]>('/categories')]),
  );
  const [params] = useSearchParams();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(''),
    [category, setCategory] = useState(0),
    [sort, setSort] = useState('name'),
    [focus, setFocus] = useState(false);
  useEffect(() => {
    if (params.has('buscar')) {
      input.current?.focus();
      document.getElementById('catalogo')?.scrollIntoView();
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
      sort === 'price'
        ? Number(a.precioVenta) - Number(b.precioVenta)
        : sort === 'priceDesc'
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
              onKeyDown={(e) => e.key === 'Escape' && setFocus(false)}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                aria-label="Limpiar búsqueda"
                onClick={() => setQuery('')}
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
            className={!category ? 'active' : ''}
            onClick={() => setCategory(0)}
          >
            Todos los productos
          </button>
          {data?.[1].map((c) => (
            <button
              className={category === c.id ? 'active' : ''}
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
                setQuery('');
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
export function ProductDetail() {
  const { id } = useParams();
  const {
    data: p,
    loading,
    error,
    reload,
  } = useLoad(() => api<Product>(`/products/${id}`), [id]);
  const { add, toast } = useApp();
  const [qty, setQty] = useState(1),
    [busy, setBusy] = useState(false);
  useEffect(() => setQty(1), [id]);
  return (
    <main className="page store-page">
      <Link className="back" to="/">
        ← Volver al catálogo
      </Link>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox error={error} retry={reload} />
      ) : (
        p && (
          <div className="product-detail">
            <div className="detail-photo">
              <ProductArt product={p} />
            </div>
            <div className="detail-info">
              <span className="eyebrow">{p.categoria?.nombre}</span>
              <h1>{p.nombre}</h1>
              <p className="muted">SKU {p.sku}</p>
              <h2>{money(p.precioVenta)}</h2>
              <p>
                {p.descripcion ||
                  'Consulta la información de este producto en nuestro catálogo.'}
              </p>
              <span className="stock">
                <span className="dot" />
                {p.inventario?.stock} disponibles
              </span>
              <Quantity
                value={qty}
                max={p.inventario?.stock}
                onChange={setQty}
              />
              <Button
                busy={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await add(p, qty);
                  } catch (e) {
                    toast((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Agregar al carrito
                <Plus size={18} />
              </Button>
            </div>
          </div>
        )
      )}
    </main>
  );
}
