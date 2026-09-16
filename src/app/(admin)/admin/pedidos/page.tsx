import { desc, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { orderItems, orders } from '@/db/schema';
import { requireAdminSession } from '@/lib/auth';
import { OrdersManager, type AdminOrder } from '@/components/admin/OrdersManager';

export const metadata = { title: 'Pedidos | AQUAPORA Admin' };

export default async function AdminOrdersPage() {
  await requireAdminSession();
  const orderRows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const itemRows = orderRows.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderRows.map((order) => order.id)))
    : [];
  const itemsByOrder = new Map<string, typeof itemRows>();
  for (const item of itemRows) itemsByOrder.set(item.orderId, [...(itemsByOrder.get(item.orderId) ?? []), item]);
  const serializableOrders: AdminOrder[] = orderRows.map((order) => ({
    id: order.id,
    shortCode: order.shortCode,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    customerDistrict: order.customerDistrict,
    customerReference: order.customerReference,
    customerNotes: order.customerNotes,
    shippingMethod: order.shippingMethod,
    totalCents: order.totalCents,
    status: order.status,
    stockDeducted: order.stockDeducted,
    createdAt: order.createdAt.toISOString(),
    items: (itemsByOrder.get(order.id) ?? []).map((item) => ({ id: item.id, productName: item.productName, quantity: item.quantity, unitPriceCents: item.unitPriceCents, subtotalCents: item.subtotalCents })),
  }));

  return <div className="mx-auto max-w-7xl space-y-6"><header className="border-b border-slate-800 pb-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Ventas y entregas</p><h1 className="mt-1 text-3xl font-black text-white">Pedidos</h1><p className="mt-2 text-sm text-slate-400">Confirma pagos, descuenta o repone stock y coordina las entregas desde una sola vista.</p></header><OrdersManager orders={serializableOrders} /></div>;
}
