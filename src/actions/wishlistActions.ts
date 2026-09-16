'use server';

import { z } from 'zod';
import { and, eq, inArray } from 'drizzle-orm';
import { db, products } from '@/db';

export async function getFavoriteProducts(input: string[]) {
  const ids = z.array(z.string().uuid()).max(500).parse(input);
  if (!ids.length) return [];
  return db.select().from(products).where(and(eq(products.isActive, true), inArray(products.id, [...new Set(ids)])));
}
