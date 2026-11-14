export type Role = 'ADMIN' | 'CAJERO' | 'CLIENTE';
export type User = { id: number; nombre: string; email: string; rol: Role };
export type Category = {
  id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
};
export type Product = {
  id: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  precioVenta: string | number;
  costoCompra?: string | number;
  activo?: boolean;
  categoriaId?: number;
  categoria?: Category;
  inventario?: { stock: number };
};
export type Line = {
  id?: number;
  productoId?: number;
  producto: Product;
  cantidad: number;
  precioUnitario?: string | number;
  subtotal?: string | number;
};
export type Cart = { id: number; detalles: Line[] };
export type Address = {
  id: number;
  alias: string;
  destinatario: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  referencias?: string;
  esPrincipal: boolean;
};
export type Payment = {
  estado: string;
  metodo: string;
  monto: string | number;
};
export type Order = {
  id: number;
  estado: string;
  origen: string;
  createdAt: string;
  totalProductos: string | number;
  destinatario: string;
  telefonoDestino: string;
  ciudadDestino: string;
  direccionDestino: string;
  referencias?: string;
  detalles: Line[];
  pagos?: Payment[];
};
export type Sale = {
  id: number;
  numeroComprobante: string;
  estado: string;
  metodoPago?: string;
  total: string | number;
  createdAt: string;
  sesionCajaId: number;
  detalles: Line[];
};
export type Cash = {
  id: number;
  cajeroId: number;
  montoInicial: string;
  abiertaEn: string;
  estado: string;
};
