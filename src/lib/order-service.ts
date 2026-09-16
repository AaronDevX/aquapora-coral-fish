import { eq, inArray } from 'drizzle-orm';
import type { Transaction } from '@/db';
import { orders, orderItems, products, auditLogs } from '@/db/schema';
import { orderStockChange, type OrderStatus } from './order-state';

export async function applyOrderTransition(tx: Transaction, orderId: string, newStatus: OrderStatus) {
  const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for('update');
  if (!order) throw new Error('Pedido no encontrado.');

  const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  if (items.length === 0) throw new Error('El pedido no contiene artículos.');

  const quantityByProduct = new Map<string, { quantity: number; name: string }>();
  for (const item of items) {
    const current = quantityByProduct.get(item.productId);
    quantityByProduct.set(item.productId, {
      quantity: (current?.quantity ?? 0) + item.quantity,
      name: item.productName,
    });
  }

  let stockDeducted = order.stockDeducted;
  let stockChange: 'deducted' | 'restored' | 'none' = 'none';

  const change = orderStockChange(order.status, newStatus, order.stockDeducted);
  if (change === 'deducted') {
    const productIds = [...quantityByProduct.keys()].sort();
    const lockedProducts = await tx
      .select()
      .from(products)
      .where(inArray(products.id, productIds))
      .orderBy(products.id)
      .for('update');
    const productMap = new Map(lockedProducts.map((product) => [product.id, product]));

    for (const [productId, requested] of quantityByProduct) {
      const product = productMap.get(productId);
      if (!product || !product.isActive || (product.isWysiwyg && requested.quantity !== 1) || product.stock < requested.quantity) {
        throw new Error(`Stock insuficiente para “${requested.name}”. El pedido no fue confirmado.`);
      }
    }

    for (const [productId, requested] of quantityByProduct) {
      const product = productMap.get(productId)!;
      await tx
        .update(products)
        .set({ stock: product.stock - requested.quantity, updatedAt: new Date() })
        .where(eq(products.id, product.id));
    }
    stockDeducted = true;
    stockChange = 'deducted';
  }

  if (change === 'restored') {
    const productIds = [...quantityByProduct.keys()].sort();
    const lockedProducts = await tx
      .select()
      .from(products)
      .where(inArray(products.id, productIds))
      .orderBy(products.id)
      .for('update');
    const productMap = new Map(lockedProducts.map((product) => [product.id, product]));

    for (const [productId, requested] of quantityByProduct) {
      const product = productMap.get(productId);
      if (!product) throw new Error(`No se encontró el producto “${requested.name}” para devolver su stock.`);
      await tx
        .update(products)
        .set({ stock: product.stock + requested.quantity, updatedAt: new Date() })
        .where(eq(products.id, product.id));
    }
    stockDeducted = false;
    stockChange = 'restored';
  }

  await tx
    .update(orders)
    .set({ status: newStatus, stockDeducted, updatedAt: new Date() })
    .where(eq(orders.id, order.id));
  await tx.insert(auditLogs).values({
    action:
      stockChange === 'deducted'
        ? 'order_confirmed'
        : stockChange === 'restored'
          ? 'order_cancelled_stock_restored'
          : 'order_status_updated',
    targetEntity: 'order',
    targetId: order.id,
    changes: { previousStatus: order.status, newStatus: newStatus, stockChange },
    performedBy: 'admin',
  });
}
