export type PedidoEstado =
  | 'PEDIDO_NUEVO'
  | 'EN_COCINA'
  | 'LISTO_PARA_ENSAMBLAR'
  | 'VERIFICADO'
  | 'LISTO_RECOJO'
  | 'LISTO_DELIVERY'
  | 'EN_RUTA'
  | 'ENTREGADO'
  | 'ENTREGADO_DELIVERY'
  | 'FINALIZADO'
  | string;

export interface Pedido {
  id: string;
  estado: PedidoEstado;
  canal: string;
  items: string[];
  horneadoCompleto?: boolean;
  prepCompleta?: boolean;
  createdAt: number;
}
