export type Cash = {
  id: number;
  cajeroId: number;
  montoInicial: string;
  abiertaEn: string;
  estado: string;
};

export type CashClosing = {
  sesionId: number;
  efectivoContado: string;
  efectivoEsperado: string;
  diferencia: string;
  ventasEnEfectivo: string;
  ventasTotalesPOS: string;
};
