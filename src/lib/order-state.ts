export const ORDER_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['confirmed', 'completed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: ['cancelled'],
  cancelled: [],
};

export function orderStockChange(previous: string, next: OrderStatus, deducted: boolean) {
  if (!ORDER_STATUSES.includes(previous as OrderStatus)) throw new Error('Estado previo inválido.');
  if (previous !== next && !transitions[previous as OrderStatus].includes(next)) {
    throw new Error('Esta transición de pedido no está permitida.');
  }
  if ((next === 'confirmed' || next === 'completed') && !deducted) return 'deducted';
  if (next === 'cancelled' && deducted) return 'restored';
  return 'none';
}
