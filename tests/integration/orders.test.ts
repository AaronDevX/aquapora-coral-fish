import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test, after } from 'node:test';
import { eq } from 'drizzle-orm';
import { getPool, runTransaction, type Transaction } from '../../src/db';
import { products, orders, orderItems } from '../../src/db/schema';
import { applyOrderTransition } from '../../src/lib/order-service';

class RollbackTest extends Error {}
async function rollbackTest(work: (tx: Transaction) => Promise<void>) {
  try { await runTransaction(async (tx) => { await work(tx); throw new RollbackTest(); }); }
  catch (error) { if (!(error instanceof RollbackTest)) throw error; }
}
async function fixture(tx: Transaction, stock = 5) {
  const id = randomUUID(); const orderId = `test-${randomUUID().slice(0, 30)}`;
  await tx.insert(products).values({ id, slug: `test-${id}`, name: 'Prueba transaccional', categoryId: 'accesorios', type: 'Test', priceCents: 1234, stock, imageUrl: 'https://example.com/test.png' });
  await tx.insert(orders).values({ id: orderId, shortCode: `T${id.slice(0,8)}`, customerName: 'Test', customerPhone: '999999999', customerAddress: 'Test', customerDistrict: 'Test', shippingMethod: 'pickup', shippingCents: 0, subtotalCents: 2468, totalCents: 2468 });
  await tx.insert(orderItems).values({ orderId, productId: id, productName: 'Test', unitPriceCents: 1234, quantity: 2, subtotalCents: 2468 });
  return { id, orderId };
}
async function stock(tx: Transaction, id: string) { return (await tx.select({ stock: products.stock }).from(products).where(eq(products.id, id)))[0].stock; }

test('Neon: complete directly, repeat, cancel, repeat — no double stock changes', async () => {
  await rollbackTest(async (tx) => {
    const { id, orderId } = await fixture(tx);
    await applyOrderTransition(tx, orderId, 'completed');
    assert.equal(await stock(tx, id), 3);
    await applyOrderTransition(tx, orderId, 'completed');
    assert.equal(await stock(tx, id), 3);
    await applyOrderTransition(tx, orderId, 'cancelled');
    assert.equal(await stock(tx, id), 5);
    await applyOrderTransition(tx, orderId, 'cancelled');
    assert.equal(await stock(tx, id), 5);
    await assert.rejects(applyOrderTransition(tx, orderId, 'confirmed'), /transición/);
  });
});

test('Neon: confirmation followed by completion deducts only once', async () => {
  await rollbackTest(async (tx) => {
    const { id, orderId } = await fixture(tx);
    await applyOrderTransition(tx, orderId, 'confirmed');
    await applyOrderTransition(tx, orderId, 'completed');
    assert.equal(await stock(tx, id), 3);
    assert.equal((await tx.select().from(orders).where(eq(orders.id, orderId)))[0].stockDeducted, true);
  });
});

test('Neon: insufficient stock leaves order pending and stock untouched', async () => {
  await rollbackTest(async (tx) => {
    const { id, orderId } = await fixture(tx, 1);
    await assert.rejects(applyOrderTransition(tx, orderId, 'completed'), /Stock insuficiente/);
    assert.equal(await stock(tx, id), 1);
    assert.equal((await tx.select().from(orders).where(eq(orders.id, orderId)))[0].status, 'pending');
  });
});

after(async () => { await getPool().end(); });
