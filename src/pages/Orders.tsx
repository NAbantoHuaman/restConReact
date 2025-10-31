import { useMemo, useState } from 'react';
import { useOrderManager } from '../hooks/useOrderManager';
import { Pedido } from '../types/order';
import { Pencil, Trash2, Eye, CheckCircle, Truck, ClipboardCheck } from 'lucide-react';

function Card({ p, onAction }: { p: Pedido; onAction: (tipo: any) => void }) {
  const chipClass = p.estado === 'PEDIDO_NUEVO' || p.estado === 'EN_COCINA'
    ? 'order-chip chip-pending'
    : p.estado === 'FINALIZADO' || p.estado === 'ENTREGADO' || p.estado === 'ENTREGADO_DELIVERY'
    ? 'order-chip chip-completed'
    : 'order-chip chip-process';

  return (
    <div className="order-card hover-lift">
      <div className="order-card-header">
        <div className="order-id">{p.id}</div>
        <span className={chipClass}>{p.estado}</span>
      </div>
      <div className="text-xs text-gray-300 mt-1">Canal: {p.canal}</div>
      <div className="order-items">{p.items.join(', ')}</div>
      <div className="order-actions">
        {p.estado === 'PEDIDO_NUEVO' && (
          <button className="icon-btn info" onClick={() => onAction({ tipo: 'INICIAR_COCINA' })}>
            <ClipboardCheck size={16} /> Iniciar cocina
          </button>
        )}
        {p.estado === 'EN_COCINA' && (
          <>
            {!p.horneadoCompleto && (
              <button className="icon-btn success" onClick={() => onAction({ tipo: 'COMPLETAR_HORNEADO' })}>
                <CheckCircle size={16} /> Horneado listo
              </button>
            )}
            {!p.prepCompleta && (
              <button className="icon-btn success" onClick={() => onAction({ tipo: 'COMPLETAR_PREP' })}>
                <CheckCircle size={16} /> Papas/ensalada listas
              </button>
            )}
            {p.horneadoCompleto && p.prepCompleta && (
              <button className="icon-btn info" onClick={() => onAction({ tipo: 'MARCAR_LISTO_ENSAMBLAR' })}>
                <ClipboardCheck size={16} /> Listo para ensamblar
              </button>
            )}
          </>
        )}
        {p.estado === 'LISTO_PARA_ENSAMBLAR' && (
          <button className="icon-btn success" onClick={() => onAction({ tipo: 'VERIFICAR_PEDIDO' })}>
            <CheckCircle size={16} /> Verificar pedido
          </button>
        )}
        {p.estado === 'VERIFICADO' && (
          <>
            <button className="icon-btn info" onClick={() => onAction({ tipo: 'DERIVAR_RECOJO' })}><ClipboardCheck size={16} /> Recojo</button>
            <button className="icon-btn info" onClick={() => onAction({ tipo: 'DERIVAR_DELIVERY' })}><Truck size={16} /> Delivery</button>
          </>
        )}
        {p.estado === 'LISTO_DELIVERY' && (
          <button className="icon-btn info" onClick={() => onAction({ tipo: 'MARCAR_EN_RUTA' })}><Truck size={16} /> En ruta</button>
        )}
        {p.estado === 'EN_RUTA' && (
          <button className="icon-btn success" onClick={() => onAction({ tipo: 'MARCAR_ENTREGADO_DELIVERY' })}>
            <CheckCircle size={16} /> Entregado (Delivery)
          </button>
        )}
        {p.estado === 'LISTO_RECOJO' && (
          <button className="icon-btn success" onClick={() => onAction({ tipo: 'MARCAR_ENTREGADO_RECOJO' })}>
            <CheckCircle size={16} /> Entregado (Recojo)
          </button>
        )}
        {(p.estado === 'ENTREGADO' || p.estado === 'ENTREGADO_DELIVERY') && (
          <button className="icon-btn success" onClick={() => onAction({ tipo: 'FINALIZAR' })}>Finalizar</button>
        )}
        {}
        <button className="icon-btn" title="Ver detalles"><Eye size={16} /> Detalles</button>
        <button className="icon-btn" title="Editar"><Pencil size={16} /> Editar</button>
        <button className="icon-btn danger" title="Eliminar"><Trash2 size={16} /> Eliminar</button>
      </div>
    </div>
  );
}

export default function Orders() {
  const { pedidos, actualizarPedido, crearPedido } = useOrderManager();
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_process' | 'completed'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [toastMsg, setToastMsg] = useState<string>('');

  const onAction = (id: string, e: any) => {
    actualizarPedido(id, e);
    setToastMsg('Acción realizada');
    setTimeout(() => setToastMsg(''), 1200);
  };

  const groups = useMemo(() => {
    const sorted = [...pedidos].sort((a, b) => (sort === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt));
    const isPending = (s: Pedido['estado']) => s === 'PEDIDO_NUEVO' || s === 'EN_COCINA';
    const isCompleted = (s: Pedido['estado']) => s === 'FINALIZADO' || s === 'ENTREGADO' || s === 'ENTREGADO_DELIVERY';
    const isProcess = (s: Pedido['estado']) => !isPending(s) && !isCompleted(s);

    const pending = sorted.filter(p => isPending(p.estado));
    const process = sorted.filter(p => isProcess(p.estado));
    const completed = sorted.filter(p => isCompleted(p.estado));
    return { pending, process, completed };
  }, [pedidos, sort]);

  const renderList = (list: Pedido[]) => (
    <div className="grid gap-4" style={{ gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr' }}>
      {list.map((p) => (
        <Card key={p.id} p={p} onAction={(e) => onAction(p.id, e)} />
      ))}
    </div>
  );

  const groupOrder = filter === 'all' ? ['pending', 'process', 'completed'] : [filter];

  return (
    <div className="orders-container">
      <h2 className="text-2xl font-bold mb-3">Gestión de Pedidos</h2>
      <div className="orders-toolbar">
        <div className="flex gap-2">
          <button className="icon-btn info" onClick={() => crearPedido('MOSTRADOR', ['1/2 Pollo', 'Papas'])}>Nuevo (Mostrador)</button>
          <button className="icon-btn info" onClick={() => crearPedido('TELEFONO', ['Pollo entero'])}>Nuevo (Teléfono)</button>
          <button className="icon-btn info" onClick={() => crearPedido('APP', ['Combo familiar'])}>Nuevo (App)</button>
        </div>
        <select className="orders-filter" value={filter} onChange={(e) => setFilter(e.target.value as any)} aria-label="Filtrar por estado">
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="in_process">En proceso</option>
          <option value="completed">Completados</option>
        </select>
        <div className="flex gap-2">
          <select className="orders-sort" value={sort} onChange={(e) => setSort(e.target.value as any)} aria-label="Ordenar">
            <option value="newest">Más nuevos</option>
            <option value="oldest">Más antiguos</option>
          </select>
          <select className="orders-view" value={view} onChange={(e) => setView(e.target.value as any)} aria-label="Vista">
            <option value="grid">Cuadrícula</option>
            <option value="list">Lista</option>
          </select>
        </div>
      </div>

      <div className="orders-grid">
        {groupOrder.map((g) => (
          <div key={g} className="orders-group">
            <div className="orders-group-title">
              {g === 'pending' ? 'Pendientes' : g === 'process' ? 'En proceso' : 'Completados'}
            </div>
            {renderList(g === 'pending' ? groups.pending : g === 'process' ? groups.process : groups.completed)}
          </div>
        ))}
      </div>

      <div className={`toast ${toastMsg ? 'show' : ''}`} role="status" aria-live="polite">{toastMsg}</div>
    </div>
  );
}