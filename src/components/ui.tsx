import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
} from 'react';
import {
  X,
  LoaderCircle,
  PackageOpen,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { money } from '../utils';
import type { Line } from '../types';
export function Button({
  children,
  busy,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      {...props}
      disabled={busy || props.disabled}
      className={`btn ${className}`}
    >
      {busy && <LoaderCircle className="spin" size={17} />}
      {children}
    </button>
  );
}
export function Badge({ value }: { value: string }) {
  return (
    <span className={`badge state-${value.toLowerCase()}`}>
      {value.replaceAll('_', ' ')}
    </span>
  );
}
export function Empty({
  title = 'No hay resultados',
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
export function Loading() {
  return (
    <div className="skeletons" aria-label="Cargando" aria-busy="true">
      {[1, 2, 3, 4].map((i) => (
        <div className="skeleton" key={i} />
      ))}
    </div>
  );
}
export function ErrorBox({
  error,
  retry,
}: {
  error: string;
  retry?: () => void;
}) {
  return (
    <div className="alert danger" role="alert">
      <AlertCircle size={19} />
      <span>{error}</span>
      {retry && (
        <Button className="secondary" onClick={retry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  drawer = false,
  busy = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  drawer?: boolean;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    const d = ref.current!;
    d.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      d.close();
      document.body.style.overflow = prev;
      before?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={drawer ? 'drawer' : ''}
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) closeRef.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          const r = ref.current!.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            closeRef.current();
        }
      }}
    >
      <header className="modal-head">
        <h2 id="modal-title">{title}</h2>
        <button
          className="icon"
          onClick={onClose}
          disabled={busy}
          aria-label="Cerrar"
        >
          <X />
        </button>
      </header>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}
export function Quantity({
  value,
  max,
  onChange,
  disabled,
}: {
  value: number;
  max?: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="quantity">
      <button
        aria-label="Reducir cantidad"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={14} />
      </button>
      <span aria-live="polite">{value}</span>
      <button
        aria-label="Aumentar cantidad"
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
export function LineItems({ lines }: { lines: Line[] }) {
  return (
    <div>
      {lines.map((l, i) => (
        <div className="line" key={l.id ?? i}>
          <div className="mini-art">
            <PackageOpen size={24} />
          </div>
          <div className="grow">
            <strong>{l.producto.nombre}</strong>
            <small>
              {l.cantidad} × {money(l.precioUnitario ?? l.producto.precioVenta)}
            </small>
          </div>
          <b>
            {money(
              l.subtotal ??
                Number(l.precioUnitario ?? l.producto.precioVenta) * l.cantidad,
            )}
          </b>
        </div>
      ))}
    </div>
  );
}
export function useLoad<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    loader()
      .then((v) => {
        if (active) setData(v);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [...deps, version]);
  return {
    data,
    setData,
    error,
    loading,
    reload: () => setVersion((v) => v + 1),
  };
}
