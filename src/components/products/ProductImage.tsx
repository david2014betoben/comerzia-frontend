import { Package } from "lucide-react";
import { useState } from "react";
import type { Product } from "../../types/products";
import { productImage } from "../../utils/productImages";

export function ProductImage({ product: p }: { product: Product }) {
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
