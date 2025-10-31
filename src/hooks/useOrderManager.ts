import { useState } from 'react';
import type { Pedido } from '../types/order';

export function useOrderManager() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  const actualizarPedido = (id: string, e: any) => {
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, ...e } : p)));
  };

  const crearPedido = (canal: string, items: string[]) => {
    const nuevo: Pedido = {
      id: Math.random().toString(36).slice(2),
      estado: 'PEDIDO_NUEVO',
      canal,
      items,
      createdAt: Date.now(),
    };
    setPedidos((prev) => [nuevo, ...prev]);
  };

  return { pedidos, actualizarPedido, crearPedido };
}