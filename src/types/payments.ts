export type Payment = {
  estado: string;
  metodo: string;
  monto: string | number;
};

export type PaymentResult = {
  simulacion: boolean;
  procesado: boolean;
  pagoEstado: string;
  pedidoEstado?: string;
  motivo?: string;
};
