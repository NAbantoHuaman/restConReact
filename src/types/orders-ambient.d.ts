declare module '../types/order' {
  export interface Pedido {
    id: string;
    estado: 'PEDIDO_NUEVO' | 'EN_COCINA' | 'LISTO_PARA_ENSAMBLAR' | 'VERIFICADO' | 'LISTO_RECOJO' | 'LISTO_DELIVERY' | 'EN_RUTA' | 'ENTREGADO' | 'ENTREGADO_DELIVERY' | 'FINALIZADO' | string;
    canal: string;
    items: string[];
    horneadoCompleto?: boolean;
    prepCompleta?: boolean;
    createdAt: number;
  }
}

declare module '../hooks/useOrderManager' {
  import type { Pedido } from '../types/order';
  export function useOrderManager(): {
    pedidos: Pedido[];
    actualizarPedido: (id: string, e: any) => void;
    crearPedido: (canal: string, items: string[]) => void;
  };
}