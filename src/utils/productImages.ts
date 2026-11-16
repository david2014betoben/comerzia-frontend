import images from "../assets/design-images.json";
import type { Product } from "../types/products";

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
