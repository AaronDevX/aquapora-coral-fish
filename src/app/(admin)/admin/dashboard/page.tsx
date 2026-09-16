import Link from 'next/link';
import { and, count, desc, eq, inArray, lte, sql } from 'drizzle-orm';
import { AlertTriangle, ArrowRight, ClipboardList, DollarSign, PackageCheck, PackageX } from 'lucide-react';
import { db } from '@/db';
import { categories, orders, products } from '@/db/schema';
import { requireAdminSession } from '@/lib/auth';

const money = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

function statusLabel(status: string) {
  return { pending: 'Pendiente', confirmed: 'Confirmado', completed: 'Completado', cancelled: 'Cancelado' }[status] ?? status;
}

export default async function AdminDashboardPage() {
  await requireAdminSession();

  const [revenueRow, pendingRow, activeProductsRow, criticalProducts, latestOrders] = await Promise.all([
    db
      .select({ total: sql<number>`coalesce(sum(${orders.totalCents}), 0)` })
      .from(orders)
      .where(inArray(orders.status, ['confirmed', 'completed'])),
    db.select({ total: count() }).from(orders).where(eq(orders.status, 'pending')),
    db.select({ total: count() }).from(products).where(eq(products.isActive, true)),
    db
      .select({
        id: products.id,
        name: products.name,
        stock: products.stock,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.isActive, true),
          lte(products.stock, 3),
          inArray(products.categoryId, [
            'corales-sps',
            'corales-lps',
            'corales-blandos',
            'peces-marinos',
            'anemonas',
            'invertebrados',
          ])
        )
      )
      .orderBy(products.stock, products.name)
      .limit(8),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
  ]);

  const metrics = [
    {
      label: 'Total facturado',
      value: money.format(Number(revenueRow[0]?.total ?? 0) / 100),
      description: 'Pedidos confirmados y completados',
      icon: DollarSign,
      color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Pedidos por atender',
      value: String(pendingRow[0]?.total ?? 0),
      description: 'Esperando confirmación de pago',
      icon: ClipboardList,
      color: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Productos activos',
      value: String(activeProductsRow[0]?.total ?? 0),
      description: 'Disponibles en la tienda pública',
      icon: PackageCheck,
      color: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-col gap-2 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Vista general</p>
          <h1 className="mt-1 text-3xl font-black text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Operación, inventario vivo y pedidos de AQUAPORA.</p>
        </div>
        <Link href="/admin/pedidos" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 hover:text-cyan-200">
          Ver todos los pedidos <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map(({ label, value, description, icon: Icon, color }) => (
          <article key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-black tracking-tight text-white">{value}</p>
              </div>
              <span className={`rounded-xl border p-2.5 ${color}`}><Icon className="h-5 w-5" /></span>
            </div>
            <p className="mt-3 text-xs text-slate-500">{description}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-300" /><h2 className="font-bold text-white">Stock crítico</h2></div>
            <Link href="/admin/productos" className="text-xs font-bold text-cyan-400 hover:text-cyan-300">Gestionar</Link>
          </div>
          {criticalProducts.length ? (
            <ul className="divide-y divide-slate-800">
              {criticalProducts.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-200">{product.name}</p><p className="mt-0.5 text-xs text-slate-500">{product.categoryName ?? 'Sin categoría'}</p></div>
                  <Link href={`/admin/productos?edit=${product.id}`} className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-black ${product.stock === 0 ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                    {product.stock === 0 ? 'Agotado' : `${product.stock} uds.`}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-12 text-center"><PackageX className="mx-auto h-7 w-7 text-emerald-400" /><p className="mt-3 text-sm font-bold text-slate-300">Inventario saludable</p><p className="mt-1 text-xs text-slate-500">No hay corales ni peces con stock crítico.</p></div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4"><h2 className="font-bold text-white">Últimos pedidos</h2><Link href="/admin/pedidos" className="text-xs font-bold text-cyan-400 hover:text-cyan-300">Ver historial</Link></div>
          {latestOrders.length ? (
            <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Pedido</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Total</th><th className="px-5 py-3">Estado</th></tr></thead><tbody className="divide-y divide-slate-800">{latestOrders.map((order) => <tr key={order.id}><td className="px-5 py-3.5 font-mono text-xs font-bold text-cyan-300">{order.shortCode}</td><td className="px-4 py-3.5 text-slate-300">{order.customerName}</td><td className="px-4 py-3.5 font-semibold text-slate-200">{money.format(order.totalCents / 100)}</td><td className="px-5 py-3.5"><span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-300">{statusLabel(order.status)}</span></td></tr>)}</tbody></table></div>
          ) : <p className="px-5 py-12 text-center text-sm text-slate-500">Aún no se han recibido pedidos.</p>}
        </section>
      </div>
    </div>
  );
}
