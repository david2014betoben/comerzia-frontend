export type Category = {
  id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
};

export type CategoryInput = { nombre: string; descripcion?: string };
