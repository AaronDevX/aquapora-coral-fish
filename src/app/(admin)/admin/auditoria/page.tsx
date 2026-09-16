import { desc } from 'drizzle-orm';
import { History, ShieldCheck } from 'lucide-react';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { requireAdminSession } from '@/lib/auth';

const actionLabels: Record<string, string> = {
  login_succeeded: 'Inicio de sesión',
  logout: 'Cierre de sesión',
  stock_updated: 'Stock actualizado',
  product_created: 'Producto creado',
  product_updated: 'Producto actualizado',
  product_deactivated: 'Producto desactivado',
  order_confirmed: 'Pedido confirmado / stock descontado',
  order_cancelled_stock_restored: 'Pedido cancelado / stock repuesto',
  order_status_updated: 'Estado de pedido actualizado',
};

function formatChanges(changes: unknown): string {
  if (!changes || typeof changes !== 'object') return 'Sin detalles adicionales';
  return Object.entries(changes as Record<string, unknown>)
    .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
    .join(' · ');
}

export const metadata = { title: 'Auditoría | AQUAPORA Admin' };

export default async function AdminAuditPage() {
  await requireAdminSession();
  const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(250);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Trazabilidad segura</p><h1 className="mt-1 text-3xl font-black text-white">Registro de auditoría</h1><p className="mt-2 text-sm text-slate-400">Últimos 250 eventos administrativos, mostrados en orden cronológico inverso.</p></div><div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300"><ShieldCheck className="h-4 w-4" />Cambios auditables</div></header>
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70"><div className="overflow-x-auto"><table className="min-w-[800px] w-full text-left text-sm"><thead className="bg-slate-950/60 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Fecha / hora</th><th className="px-4 py-3">Acción</th><th className="px-4 py-3">Entidad</th><th className="px-4 py-3">Identificador</th><th className="px-5 py-3">Detalle</th></tr></thead><tbody className="divide-y divide-slate-800">{logs.map((log) => <tr key={log.id} className="align-top hover:bg-slate-800/25"><td className="whitespace-nowrap px-5 py-3.5 text-xs text-slate-400">{new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'medium' }).format(log.createdAt)}</td><td className="px-4 py-3.5"><span className="rounded-full bg-cyan-500/10 px-2 py-1 text-[10px] font-bold text-cyan-300">{actionLabels[log.action] ?? log.action}</span></td><td className="px-4 py-3.5 text-xs font-semibold text-slate-300">{log.targetEntity}</td><td className="max-w-45 truncate px-4 py-3.5 font-mono text-xs text-slate-400">{log.targetId}</td><td className="max-w-md px-5 py-3.5 text-xs leading-relaxed text-slate-500">{formatChanges(log.changes)}</td></tr>)}</tbody></table></div>{logs.length === 0 && <div className="px-5 py-16 text-center"><History className="mx-auto h-8 w-8 text-slate-600" /><p className="mt-3 text-sm text-slate-500">Aún no hay eventos de auditoría.</p></div>}</div>
    </div>
  );
}
