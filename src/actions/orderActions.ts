'use server';

import { cookies } from 'next/headers';
import { createReceiptAccess, receiptCookieName } from '@/lib/receipt';

import { randomBytes } from 'node:crypto';
import { runTransaction } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { inArray } from 'drizzle-orm';
import {
  checkoutSchema,
  SHIPPING_METHODS,
  type ShippingMethodKey,
} from '@/lib/validations/checkout';
import { generateWhatsAppOrderUrl } from '@/lib/whatsapp';

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  shortCode?: string;
  whatsappUrl?: string;
  totalCents?: number;
  error?: string;
}

function getRandomAlphaNum(length: number): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const random = randomBytes(length);

  // The alphabet has 32 characters, so the low five bits are unbiased.
  return Array.from(random, (byte) => chars[byte & 31]).join('');
}

function generateOrderIdentifiers() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts();
  const date = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );
  const dateStr = `${date.year}${date.month}${date.day}`;

  const orderId = `AQ-${dateStr}-${getRandomAlphaNum(12)}`;
  const shortCode = `#${getRandomAlphaNum(5)}`;

  return { orderId, shortCode };
}

class CheckoutError extends Error {}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505'
  );
}

export async function createOrderAction(rawData: unknown): Promise<CreateOrderResult> {
  try {
    // 1. Validate form input schema
    const parseResult = checkoutSchema.safeParse(rawData);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Datos de formulario inválidos';
      return {
        success: false,
        error: firstError,
      };
    }

    const data = parseResult.data;
    const receipt = createReceiptAccess();

    // 2. Execute an atomic SQL transaction. Retry a generated-code collision
    // (a database constraint remains the source of truth for uniqueness).
    let result: {
      orderId: string;
      shortCode: string;
      whatsappUrl: string;
      totalCents: number;
    } | undefined;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        result = await runTransaction(async (tx) => {
          const productIds = data.items.map((item) => item.productId);

          // Row locks keep the stock and price snapshot stable until the order
          // and all its line items have been persisted.
          const dbProducts = await tx
            .select()
            .from(products)
            .where(inArray(products.id, productIds))
            .orderBy(products.id)
            .for('update');

          const productMap = new Map(dbProducts.map((product) => [product.id, product]));

          let subtotalCents = 0;
          const verifiedItems: {
            productId: string;
            productName: string;
            unitPriceCents: number;
            quantity: number;
            subtotalCents: number;
          }[] = [];

          // Authoritative verification of stock and prices.
          for (const item of data.items) {
            const product = productMap.get(item.productId);

            if (!product || !product.isActive) {
              throw new CheckoutError('El producto seleccionado ya no se encuentra disponible.');
            }

            if (product.isWysiwyg && item.quantity !== 1) {
              throw new CheckoutError(`"${product.name}" es una pieza única y solo admite una unidad.`);
            }

            if (product.stock < item.quantity) {
              throw new CheckoutError(
                `Stock insuficiente para "${product.name}". Solo quedan ${product.stock} unidad(es) disponible(s).`
              );
            }

            const itemSubtotal = product.priceCents * item.quantity;
            subtotalCents += itemSubtotal;

            verifiedItems.push({
              productId: product.id,
              productName: product.name,
              unitPriceCents: product.priceCents,
              quantity: item.quantity,
              subtotalCents: itemSubtotal,
            });
          }

          const shippingMeta = SHIPPING_METHODS[data.shippingMethod as ShippingMethodKey];
          const shippingCents = shippingMeta.costCents;
          const totalCents = subtotalCents + shippingCents;

          const { orderId, shortCode } = generateOrderIdentifiers();

          await tx.insert(orders).values({
            id: orderId,
            shortCode,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            customerAddress: data.customerAddress,
            customerDistrict: data.customerDistrict,
            customerReference: data.customerReference,
            customerNotes: data.customerNotes,
            shippingMethod: data.shippingMethod,
            shippingCents,
            subtotalCents,
            totalCents,
            status: 'pending',
            stockDeducted: false,
            receiptTokenHash: receipt.hash,
          });

          await tx.insert(orderItems).values(
            verifiedItems.map((item) => ({
              orderId,
              productId: item.productId,
              productName: item.productName,
              unitPriceCents: item.unitPriceCents,
              quantity: item.quantity,
              subtotalCents: item.subtotalCents,
            }))
          );

          const whatsappUrl = generateWhatsAppOrderUrl({
            orderId,
            shortCode,
            items: verifiedItems,
            subtotalCents,
            shippingMethodName: shippingMeta.name,
            shippingCents,
            totalCents,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            customerAddress: data.customerAddress,
            customerDistrict: data.customerDistrict,
            customerReference: data.customerReference,
            customerNotes: data.customerNotes,
          });

          return { orderId, shortCode, whatsappUrl, totalCents };
        });
        break;
      } catch (error) {
        if (isUniqueViolation(error) && attempt < 4) {
          continue;
        }

        throw error;
      }
    }

    if (!result) {
      throw new Error('No fue posible generar un identificador de pedido único.');
    }

    (await cookies()).set(receiptCookieName(result.orderId), receipt.token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
      path: `/pedido/${result.orderId}`, maxAge: 60 * 60 * 24 * 30,
    });

    return {
      success: true,
      orderId: result.orderId,
      shortCode: result.shortCode,
      whatsappUrl: result.whatsappUrl,
      totalCents: result.totalCents,
    };
  } catch (error: unknown) {
    if (!(error instanceof CheckoutError)) console.error('No se pudo registrar el pedido.');
    return {
      success: false,
      error:
        error instanceof CheckoutError
          ? error.message
          : 'No pudimos registrar tu pedido. Verifica tus datos e inténtalo nuevamente.',
    };
  }
}
