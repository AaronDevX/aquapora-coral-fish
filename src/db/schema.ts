import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export interface ProductSpecs {
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto';
  lighting: 'Baja' | 'Media' | 'Alta' | 'Muy Alta (PAR 250+)';
  flow: 'Suave' | 'Moderado' | 'Fuerte / Turbulento';
  placement: 'Fondo / Arena' | 'Tercio Medio' | 'Tercio Superior';
  temperatura?: string;
  salinidad?: string;
  kh?: string;
  calcio?: string;
  magnesio?: string;
}

// ---------------------------------------------------------------------------
// 1. Categories
// ---------------------------------------------------------------------------
export const categories = pgTable('categories', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 80 }).notNull(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  description: text('description'),
  displayOrder: integer('display_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// ---------------------------------------------------------------------------
// 2. Products
// ---------------------------------------------------------------------------
export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 140 }).notNull().unique(),
    name: varchar('name', { length: 150 }).notNull(),
    scientificName: varchar('scientific_name', { length: 150 }),
    categoryId: varchar('category_id', { length: 50 })
      .references(() => categories.id)
      .notNull(),
    type: varchar('type', { length: 80 }).notNull(),
    priceCents: integer('price_cents').notNull(),
    stock: integer('stock').default(0).notNull(),
    imageUrl: text('image_url').notNull(),
    additionalImages: jsonb('additional_images').$type<string[]>().default([]).notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    isSale: boolean('is_sale').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    isWysiwyg: boolean('is_wysiwyg').default(false).notNull(),
    description: text('description').default('').notNull(),
    careInstructions: text('care_instructions').default('').notNull(),
    specs: jsonb('specs')
      .$type<ProductSpecs>()
      .default({
        difficulty: 'Intermedio',
        lighting: 'Media',
        flow: 'Moderado',
        placement: 'Tercio Medio',
      })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('category_idx').on(table.categoryId),
    index('active_idx').on(table.isActive),
    index('featured_idx').on(table.isFeatured),
  ]
);

// ---------------------------------------------------------------------------
// 3. Orders
// ---------------------------------------------------------------------------
export const orders = pgTable('orders', {
  id: varchar('id', { length: 40 }).primaryKey(),
  shortCode: varchar('short_code', { length: 12 }).notNull(),
  customerName: varchar('customer_name', { length: 120 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 30 }).notNull(),
  customerAddress: text('customer_address').notNull(),
  customerDistrict: varchar('customer_district', { length: 100 }).notNull(),
  customerReference: text('customer_reference').default(''),
  customerNotes: text('customer_notes').default(''),
  shippingMethod: varchar('shipping_method', { length: 40 }).notNull(),
  shippingCents: integer('shipping_cents').notNull(),
  subtotalCents: integer('subtotal_cents').notNull(),
  totalCents: integer('total_cents').notNull(),
  status: varchar('status', { length: 25 }).default('pending').notNull(),
  stockDeducted: boolean('stock_deducted').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// 4. Order Items
// ---------------------------------------------------------------------------
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: varchar('order_id', { length: 40 })
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  productId: uuid('product_id')
    .references(() => products.id)
    .notNull(),
  productName: varchar('product_name', { length: 150 }).notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
  quantity: integer('quantity').notNull(),
  subtotalCents: integer('subtotal_cents').notNull(),
});

// ---------------------------------------------------------------------------
// 5. Audit Logs
// ---------------------------------------------------------------------------
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  action: varchar('action', { length: 60 }).notNull(),
  targetEntity: varchar('target_entity', { length: 60 }).notNull(),
  targetId: varchar('target_id', { length: 80 }).notNull(),
  changes: jsonb('changes').default({}).notNull(),
  performedBy: varchar('performed_by', { length: 80 }).default('admin').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// ---------------------------------------------------------------------------
// Inferred TypeScript Types
// ---------------------------------------------------------------------------
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
