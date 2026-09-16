import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
const saved = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { value: {
  getItem: (key: string) => saved.get(key) ?? null,
  setItem: (key: string, value: string) => saved.set(key, value),
  removeItem: (key: string) => saved.delete(key),
} });

test('favorites toggle, persist, rehydrate, deduplicate and recover invalid storage', async () => {
  const { useWishlistStore: store } = await import('../src/store/wishlistStore');
  const id = randomUUID();
  store.getState().toggleFavorite(id);
  assert.equal(store.getState().getFavoriteCount(), 1);
  assert.equal(store.getState().isFavorite(id), true);
  await store.persist.rehydrate();
  assert.equal(store.getState().isFavorite(id), true);
  store.getState().toggleFavorite(id);
  assert.equal(store.getState().getFavoriteCount(), 0);
  saved.set('aquapora-wishlist-storage', JSON.stringify({ state: { ids: [id, id] }, version: 0 }));
  await store.persist.rehydrate();
  assert.deepEqual(store.getState().ids, [id]);
  saved.set('aquapora-wishlist-storage', JSON.stringify({ state: { ids: ['bad-id'] }, version: 0 }));
  await store.persist.rehydrate();
  assert.deepEqual(store.getState().ids, []);
});

test('cart prevents zero-stock additions, fractional quantities and multiple WYSIWYG units', async () => {
  const { useCartStore: store } = await import('../src/store/cartStore');
  const item = { id: randomUUID(), slug: 'test', name: 'Test', priceCents: 1234, imageUrl: '/test.png', maxStock: 0, isWysiwyg: false };
  store.getState().addItem(item);
  assert.equal(store.getState().getTotalItems(), 0);
  store.getState().addItem({ ...item, maxStock: 4 }, 2);
  assert.equal(store.getState().getSubtotalCents(), 2468);
  store.getState().updateQuantity(item.id, 1.5);
  assert.equal(store.getState().getTotalItems(), 2);
  store.getState().clearCart();
  store.getState().addItem({ ...item, maxStock: 4, isWysiwyg: true }, 4);
  store.getState().updateQuantity(item.id, 4);
  assert.equal(store.getState().getTotalItems(), 1);
});
