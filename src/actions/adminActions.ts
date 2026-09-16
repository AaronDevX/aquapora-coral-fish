'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { applyOrderTransition } from '@/lib/order-service';
import { ORDER_STATUSES } from '@/lib/order-state';
import { db, runTransaction } from '@/db';
import { auditLogs, categories, products, type ProductSpecs } from '@/db/schema';
import {
  allowLoginAttempt,
  createAdminSession,
  destroyAdminSession,
  requireAdminSession,
  verifyAdminCredentials,
} from '@/lib/auth';

export type AdminActionResult = {
  success: boolean;
  error?: string;
  stock?: number;
  productId?: string;
};

const productIdSchema = z.string().uuid('Producto inválido.');
const stockSchema = z.coerce.number().int().min(0).max(100_000);
const orderStatusSchema = z.enum(ORDER_STATUSES);

const productInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, 'Ingresa el nombre del producto.').max(150),
  scientificName: z.string().trim().max(150).optional(),
  categoryId: z.string().trim().min(1, 'Selecciona una categoría.').max(50),
  type: z.string().trim().min(2, 'Ingresa el tipo.').max(80),
  priceCents: z.coerce.number().int().min(0, 'El precio no puede ser negativo.').max(100_000_000),
  stock: stockSchema,
  imageUrl: z.string().url('Sube una imagen válida para el producto.').max(2_000),
  description: z.string().max(8_000).default(''),
  careInstructions: z.string().max(8_000).default(''),
  isFeatured: z.boolean(),
  isSale: z.boolean(),
  isActive: z.boolean(),
  isWysiwyg: z.boolean(),
  specs: z.object({
    difficulty: z.enum(['Principiante', 'Intermedio', 'Avanzado', 'Experto']),
    lighting: z.enum(['Baja', 'Media', 'Alta', 'Muy Alta (PAR 250+)']),
    flow: z.enum(['Suave', 'Moderado', 'Fuerte / Turbulento']),
    placement: z.enum(['Fondo / Arena', 'Tercio Medio', 'Tercio Superior']),
    kh: z.string().trim().max(60).optional(),
    calcio: z.string().trim().max(60).optional(),
    magnesio: z.string().trim().max(60).optional(),
  }),
});

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function checked(formData: FormData, key: string): boolean {
  return formValue(formData, key) === 'on' || formValue(formData, key) === 'true';
}

function makeSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 125);
}

function toProductInput(formData: FormData) {
  const id = formValue(formData, 'id').trim();
  const priceSoles = Number(formValue(formData, 'price'));

  return productInputSchema.safeParse({
    id: id || undefined,
    name: formValue(formData, 'name'),
    scientificName: formValue(formData, 'scientificName') || undefined,
    categoryId: formValue(formData, 'categoryId'),
    type: formValue(formData, 'type'),
    priceCents: Number.isFinite(priceSoles) ? Math.round(priceSoles * 100) : Number.NaN,
    stock: formValue(formData, 'stock'),
    imageUrl: formValue(formData, 'imageUrl'),
    description: formValue(formData, 'description'),
    careInstructions: formValue(formData, 'careInstructions'),
    isFeatured: checked(formData, 'isFeatured'),
    isSale: checked(formData, 'isSale'),
    isActive: checked(formData, 'isActive'),
    isWysiwyg: checked(formData, 'isWysiwyg'),
    specs: {
      difficulty: formValue(formData, 'difficulty'),
      lighting: formValue(formData, 'lighting'),
      flow: formValue(formData, 'flow'),
      placement: formValue(formData, 'placement'),
      kh: formValue(formData, 'kh') || undefined,
      calcio: formValue(formData, 'calcio') || undefined,
      magnesio: formValue(formData, 'magnesio') || undefined,
    },
  });
}

async function audit(
  action: string,
  targetEntity: string,
  targetId: string,
  changes: Record<string, unknown>
) {
  await db.insert(auditLogs).values({ action, targetEntity, targetId, changes, performedBy: 'admin' });
}

function invalidateAdminViews() {
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/productos');
  revalidatePath('/admin/pedidos');
  revalidatePath('/admin/auditoria');
  revalidatePath('/');
  revalidatePath('/catalogo');
  revalidatePath('/favoritos');
  revalidatePath('/producto/[slug]', 'page');
}

export async function loginAction(password: string, totpCode: string): Promise<AdminActionResult> {
  const credentials = z
    .object({
      password: z.string().min(1).max(512),
      totpCode: z.string().regex(/^\d{6}$/),
    })
    .safeParse({ password, totpCode });

  try {
    if (!(await allowLoginAttempt())) return { success: false, error: 'Demasiados intentos. Espera 15 minutos e inténtalo nuevamente.' };
    if (!credentials.success || !(await verifyAdminCredentials(password, totpCode))) {
      return { success: false, error: 'La contraseña o el código de autenticación no son válidos.' };
    }
    await createAdminSession();
  } catch {
    console.error('Acceso administrativo no disponible: revisa la configuración del servidor.');
    return { success: false, error: 'No se pudo iniciar sesión. Inténtalo nuevamente.' };
  }
  try {
    await audit('login_succeeded', 'session', 'aquapora-admin', { authenticatedAt: new Date().toISOString() });
  } catch (error) {
    // Authentication succeeded; do not lock out the administrator because an audit write failed.
    console.error('No se pudo registrar la auditoría de inicio de sesión:', error);
  }

  return { success: true };
}

export async function logoutAction(): Promise<AdminActionResult> {
  const session = await requireAdminSession();
  try {
    await audit('logout', 'session', session.subject, { loggedOutAt: new Date().toISOString() });
  } catch (error) {
    console.error('No se pudo registrar la auditoría de cierre de sesión:', error);
  } finally {
    await destroyAdminSession();
  }
  return { success: true };
}

export async function updateStockAction(productId: string, newStock: number): Promise<AdminActionResult> {
  await requireAdminSession();
  const id = productIdSchema.safeParse(productId);
  const stock = stockSchema.safeParse(newStock);
  if (!id.success || !stock.success) return { success: false, error: 'El stock indicado no es válido.' };

  const result = await runTransaction(async (tx) => {
    const [product] = await tx.select().from(products).where(eq(products.id, id.data)).for('update');
    if (!product) throw new Error('Producto no encontrado.');

    await tx
      .update(products)
      .set({ stock: stock.data, updatedAt: new Date() })
      .where(eq(products.id, id.data));
    await tx.insert(auditLogs).values({
      action: 'stock_updated',
      targetEntity: 'product',
      targetId: id.data,
      changes: { previousStock: product.stock, newStock: stock.data },
      performedBy: 'admin',
    });
    return stock.data;
  });

  invalidateAdminViews();
  return { success: true, stock: result };
}

export async function upsertProductAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdminSession();
  const parsed = toProductInput(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos de producto inválidos.' };

  const input = parsed.data;
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, input.categoryId), eq(categories.isActive, true)));
  if (!category) return { success: false, error: 'La categoría seleccionada no está disponible.' };

  try {
    if (input.id) {
      const updated = await runTransaction(async (tx) => {
        const [existing] = await tx.select().from(products).where(eq(products.id, input.id!)).for('update');
        if (!existing) return false;

        await tx
          .update(products)
          .set({
            name: input.name,
            scientificName: input.scientificName || null,
            categoryId: input.categoryId,
            type: input.type,
            priceCents: input.priceCents,
            stock: input.stock,
            imageUrl: input.imageUrl,
            isFeatured: input.isFeatured,
            isSale: input.isSale,
            isActive: input.isActive,
            isWysiwyg: input.isWysiwyg,
            description: input.description,
            careInstructions: input.careInstructions,
            specs: input.specs as ProductSpecs,
            updatedAt: new Date(),
          })
          .where(eq(products.id, input.id!));
        await tx.insert(auditLogs).values({
          action: 'product_updated',
          targetEntity: 'product',
          targetId: input.id!,
          changes: { name: input.name, stock: input.stock, priceCents: input.priceCents },
          performedBy: 'admin',
        });
        return true;
      });
      if (!updated) return { success: false, error: 'Producto no encontrado.' };
      invalidateAdminViews();
      return { success: true, productId: input.id };
    }

    const baseSlug = makeSlug(input.name) || 'producto';
    const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
    const created = await runTransaction(async (tx) => {
      const [newProduct] = await tx
        .insert(products)
        .values({
          slug,
          name: input.name,
          scientificName: input.scientificName || null,
          categoryId: input.categoryId,
          type: input.type,
          priceCents: input.priceCents,
          stock: input.stock,
          imageUrl: input.imageUrl,
          isFeatured: input.isFeatured,
          isSale: input.isSale,
          isActive: input.isActive,
          isWysiwyg: input.isWysiwyg,
          description: input.description,
          careInstructions: input.careInstructions,
          specs: input.specs as ProductSpecs,
        })
        .returning({ id: products.id });
      await tx.insert(auditLogs).values({
        action: 'product_created',
        targetEntity: 'product',
        targetId: newProduct.id,
        changes: { name: input.name, stock: input.stock },
        performedBy: 'admin',
      });
      return newProduct;
    });
    invalidateAdminViews();
    return { success: true, productId: created.id };
  } catch (error) {
    console.error('No se pudo guardar el producto:', error);
    return { success: false, error: 'No se pudo guardar el producto. Inténtalo nuevamente.' };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string
): Promise<AdminActionResult> {
  await requireAdminSession();
  const orderIdResult = z.string().trim().min(1).max(40).safeParse(orderId);
  const statusResult = orderStatusSchema.safeParse(newStatus);
  if (!orderIdResult.success || !statusResult.success) {
    return { success: false, error: 'El pedido o estado indicado no es válido.' };
  }

  try {
    await runTransaction((tx) => applyOrderTransition(tx, orderIdResult.data, statusResult.data));
    invalidateAdminViews();
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'No se pudo actualizar el pedido.' };
  }
}

export async function deleteProductAction(productId: string): Promise<AdminActionResult> {
  await requireAdminSession();
  const id = productIdSchema.safeParse(productId);
  if (!id.success) return { success: false, error: 'Producto inválido.' };

  const [product] = await db.select().from(products).where(eq(products.id, id.data));
  if (!product) return { success: false, error: 'Producto no encontrado.' };

  await db
    .update(products)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(products.id, id.data));
  await audit('product_deactivated', 'product', id.data, { name: product.name, previousActive: product.isActive });
  invalidateAdminViews();
  return { success: true };
}
