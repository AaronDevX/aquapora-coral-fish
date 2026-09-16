'use client';

import { useMemo, useState, useTransition } from 'react';
import { ExternalLink, LoaderCircle, MapPin, PackageOpen, Phone, Truck, X } from 'lucide-react';
import { updateOrderStatusAction } from '@/actions/adminActions';

export type AdminOrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
};

export type AdminOrder = {
  id: string;
  shortCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerDistrict: string;
  customerReference: string | null;
  customerNotes: string | null;
  shippingMethod: string;
  totalCents: number;
  status: string;
  stockDeducted: boolean;
  createdAt: string;
  items: AdminOrderItem[];
};

const money = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const statusOptions = ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const;
const labels: Record<string, string> = { all: 'Todos', pending: 'Pendiente', confirmed: 'Confirmado', completed: 'Completado', cancelled: 'Cancelado' };
const styles: Record<string, string> = { pending: 'bg-amber-500/10 text-amber-300 border-amber-500/20', confirmed: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20', completed: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', cancelled: 'bg-rose-500/10 text-rose-300 border-rose-500/20' };

export function OrdersManager({ orders: initialOrders }: { orders: AdminOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<(typeof statusOptions)[number]>('all');
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const visibleOrders = useMemo(() => filter === 'all' ? orders : orders.filter((order) => order.status === filter), [filter, orders]);

  function changeStatus(order: AdminOrder, status: 'confirmed' | 'completed' | 'cancelled') {
    const confirmation = status === 'confirmed'
      ? `¿Confirmar pago de ${order.shortCode}? El stock de sus artículos se descontará de forma atómica.`
      : status === 'cancelled'
        ? `¿Cancelar ${order.shortCode}? Si se descontó stock, se devolverá automáticamente.`
        : `¿Marcar ${order.shortCode} como completado/entregado?`;
    if (!window.confirm(confirmation)) return;
    setMessage(null); setPendingId(order.id);
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, status);
      setPendingId(null);
      if (!result.success) { setMessage(result.error ?? 'No se pudo actualizar el pedido.'); return; }
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status, stockDeducted: (status === 'confirmed' || status === 'completed') ? true : status === 'cancelled' ? false : item.stockDeducted } : item));
      setSelected((current) => current?.id === order.id ? { ...current, status, stockDeducted: (status === 'confirmed' || status === 'completed') ? true : status === 'cancelled' ? false : current.stockDeducted } : current);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
        {statusOptions.map((status) => <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-xl px-3 py-2 text-xs font-bold transition ${filter === status ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>{labels[status]}</button>)}
      </div>
      {message && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-200">{message}</p>}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70"><div className="overflow-x-auto"><table className="min-w-[1050px] w-full text-left text-sm"><thead className="bg-slate-950/60 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Pedido</th><th className="px-4 py-3">Cliente y envío</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Estado</th><th className="px-5 py-3 text-right">Gestión</th></tr></thead><tbody className="divide-y divide-slate-800">{visibleOrders.map((order) => { const isPending = pendingId === order.id || pending; const whatsapp = order.customerPhone.replace(/\D/g, ''); return <tr key={order.id} className="align-top hover:bg-slate-800/25"><td className="px-5 py-4"><p className="font-mono text-xs font-black text-cyan-300">{order.shortCode}</p><p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.createdAt))}</p></td><td className="px-4 py-4"><p className="font-bold text-slate-200">{order.customerName}</p><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-300 hover:text-emerald-200"><Phone className="h-3 w-3" />{order.customerPhone}<ExternalLink className="h-3 w-3" /></a><p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500"><Truck className="h-3 w-3" />{order.shippingMethod} · {order.customerDistrict}</p></td><td className="px-4 py-4 font-bold text-slate-100">{money.format(order.totalCents / 100)}</td><td className="px-4 py-4"><span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold ${styles[order.status] ?? 'border-slate-700 bg-slate-800 text-slate-300'}`}>{labels[order.status] ?? order.status}</span>{order.stockDeducted && <p className="mt-1.5 text-[10px] font-semibold text-slate-500">Stock descontado</p>}</td><td className="px-5 py-4"><div className="flex justify-end gap-1.5"><button type="button" title="Ver detalle" onClick={() => setSelected(order)} className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-cyan-500 hover:text-cyan-300"><PackageOpen className="h-4 w-4" /></button>{order.status === 'pending' && <button type="button" disabled={isPending} onClick={() => changeStatus(order, 'confirmed')} className="rounded-lg bg-cyan-400 px-2.5 py-2 text-[11px] font-black text-slate-950 hover:bg-cyan-300 disabled:opacity-50">{isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Confirmar pago'}</button>}{order.status === 'confirmed' && <button type="button" disabled={isPending} onClick={() => changeStatus(order, 'completed')} className="rounded-lg bg-emerald-400 px-2.5 py-2 text-[11px] font-black text-slate-950 hover:bg-emerald-300 disabled:opacity-50">Entregado</button>}{order.status !== 'cancelled' && <button type="button" disabled={isPending} onClick={() => changeStatus(order, 'cancelled')} className="rounded-lg border border-rose-500/30 px-2.5 py-2 text-[11px] font-bold text-rose-300 hover:bg-rose-500/10 disabled:opacity-50">Cancelar</button>}</div></td></tr>; })}</tbody></table></div>{visibleOrders.length === 0 && <p className="px-5 py-12 text-center text-sm text-slate-500">No hay pedidos con este estado.</p>}</div>

      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function OrderDetail({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const whatsapp = order.customerPhone.replace(/\D/g, '');
  return <div className="fixed inset-0 z-50 flex items-end bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="order-detail-title"><section className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:rounded-3xl sm:p-7"><header className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4"><div><p className="font-mono text-xs font-black text-cyan-300">{order.shortCode}</p><h2 id="order-detail-title" className="mt-1 text-xl font-black text-white">Detalle de pedido</h2></div><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Cerrar detalle"><X className="h-5 w-5" /></button></header><div className="grid gap-5 py-5 sm:grid-cols-2"><section className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><h3 className="font-bold text-slate-200">Cliente</h3><p className="mt-3 text-sm font-semibold text-white">{order.customerName}</p><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-sm text-emerald-300"><Phone className="h-3.5 w-3.5" />{order.customerPhone}</a><p className="mt-3 flex gap-1.5 text-xs leading-relaxed text-slate-400"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />{order.customerAddress}, {order.customerDistrict}{order.customerReference ? ` · ${order.customerReference}` : ''}</p></section><section className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><h3 className="font-bold text-slate-200">Entrega</h3><p className="mt-3 flex items-center gap-1.5 text-sm text-slate-300"><Truck className="h-4 w-4 text-cyan-300" />{order.shippingMethod}</p>{order.customerNotes && <p className="mt-3 text-xs leading-relaxed text-slate-400"><span className="font-bold text-slate-300">Notas:</span> {order.customerNotes}</p>}</section></div><section className="overflow-hidden rounded-xl border border-slate-800"><div className="border-b border-slate-800 bg-slate-950/50 px-4 py-3 text-sm font-bold text-white">Artículos comprados</div><ul className="divide-y divide-slate-800">{order.items.map((item) => <li key={item.id} className="flex items-center justify-between gap-4 px-4 py-3"><div><p className="text-sm font-semibold text-slate-200">{item.productName}</p><p className="text-xs text-slate-500">{item.quantity} × {money.format(item.unitPriceCents / 100)}</p></div><p className="font-bold text-slate-200">{money.format(item.subtotalCents / 100)}</p></li>)}</ul><div className="flex justify-between bg-slate-950/50 px-4 py-3"><span className="font-black text-slate-100">Total</span><span className="font-black text-cyan-300">{money.format(order.totalCents / 100)}</span></div></section></section></div>;
}
