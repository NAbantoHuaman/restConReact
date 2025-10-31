import { Pedido } from '../types/order';
type EventoPedido = {
  tipo:
    | 'INICIAR_COCINA'
    | 'COMPLETAR_HORNEADO'
    | 'COMPLETAR_PREP'
    | 'MARCAR_LISTO_ENSAMBLAR'
    | 'VERIFICAR_PEDIDO'
    | 'DERIVAR_RECOJO'
    | 'DERIVAR_DELIVERY'
    | 'MARCAR_EN_RUTA'
    | 'MARCAR_ENTREGADO_RECOJO'
    | 'MARCAR_ENTREGADO_DELIVERY'
    | 'FINALIZAR';
};

function withLog(p: Pedido, accion: string, nota?: string): Pedido {
  return {
    ...p,
    logs: [...(p.logs || []), { at: Date.now(), accion, nota }],
  };
}

export function aplicarEvento(pedido: Pedido, evento: EventoPedido): Pedido {
  switch (evento.tipo) {
    case 'INICIAR_COCINA': {
      if (pedido.estado !== 'PEDIDO_NUEVO') return pedido;
      return withLog({ ...pedido, estado: 'EN_COCINA' }, 'INICIAR_COCINA');
    }
    case 'COMPLETAR_HORNEADO': {
      if (pedido.estado !== 'EN_COCINA') return pedido;
      const actualizado = { ...pedido, horneadoCompleto: true };
      return withLog(actualizado, 'COMPLETAR_HORNEADO');
    }
    case 'COMPLETAR_PREP': {
      if (pedido.estado !== 'EN_COCINA') return pedido;
      const actualizado = { ...pedido, prepCompleta: true };
      return withLog(actualizado, 'COMPLETAR_PREP');
    }
    case 'MARCAR_LISTO_ENSAMBLAR': {
      if (pedido.estado !== 'EN_COCINA') return pedido;
      if (!(pedido.horneadoCompleto && pedido.prepCompleta)) return pedido;
      return withLog(
        { ...pedido, estado: 'LISTO_PARA_ENSAMBLAR' },
        'MARCAR_LISTO_ENSAMBLAR'
      );
    }
    case 'VERIFICAR_PEDIDO': {
      if (pedido.estado !== 'LISTO_PARA_ENSAMBLAR') return pedido;
      return withLog({ ...pedido, estado: 'VERIFICADO' }, 'VERIFICAR_PEDIDO');
    }
    case 'DERIVAR_RECOJO': {
      if (pedido.estado !== 'VERIFICADO') return pedido;
      return withLog(
        { ...pedido, estado: 'LISTO_RECOJO', modalidad: 'RECOJO' },
        'DERIVAR_RECOJO'
      );
    }
    case 'DERIVAR_DELIVERY': {
      if (pedido.estado !== 'VERIFICADO') return pedido;
      return withLog(
        { ...pedido, estado: 'LISTO_DELIVERY', modalidad: 'DELIVERY' },
        'DERIVAR_DELIVERY'
      );
    }
    case 'MARCAR_EN_RUTA': {
      if (pedido.estado !== 'LISTO_DELIVERY') return pedido;
      return withLog({ ...pedido, estado: 'EN_RUTA' }, 'MARCAR_EN_RUTA');
    }
    case 'MARCAR_ENTREGADO_RECOJO': {
      if (pedido.estado !== 'LISTO_RECOJO') return pedido;
      return withLog({ ...pedido, estado: 'ENTREGADO' }, 'MARCAR_ENTREGADO_RECOJO');
    }
    case 'MARCAR_ENTREGADO_DELIVERY': {
      if (pedido.estado !== 'EN_RUTA') return pedido;
      return withLog(
        { ...pedido, estado: 'ENTREGADO_DELIVERY' },
        'MARCAR_ENTREGADO_DELIVERY'
      );
    }
    case 'FINALIZAR': {
      if (pedido.estado !== 'ENTREGADO' && pedido.estado !== 'ENTREGADO_DELIVERY')
        return pedido;
      return withLog({ ...pedido, estado: 'FINALIZADO' }, 'FINALIZAR');
    }
    default:
      return pedido;
  }
}

export function crearPedidoInicial(
  id: string,
  canal: Pedido['canal'],
  items: string[]
): Pedido {
  return {
    id,
    canal,
    items,
    estado: 'PEDIDO_NUEVO',
    // modalidad is set later in the flow
    createdAt: Date.now(),
    horneadoCompleto: false,
    prepCompleta: false,
    logs: [{ at: Date.now(), accion: 'CREAR', nota: 'Pedido nuevo' }] as any,
  };
}