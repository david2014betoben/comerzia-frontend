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

export type AddressInput = Omit<Address, "id">;
