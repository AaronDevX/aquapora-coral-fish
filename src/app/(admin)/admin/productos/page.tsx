import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { categories, products } from '@/db/schema';
import { requireAdminSession } from '@/lib/auth';
import { ProductsManager } from '@/components/admin/ProductsManager';

export const metadata = { title: 'Productos e inventario | AQUAPORA Admin' };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  await requireAdminSession();
  const [{ edit }, productRows, categoryRows] = await Promise.all([
    searchParams,
    db.select({
      id: products.id,
      name: products.name,
      scientificName: products.scientificName,
      categoryId: products.categoryId,
      type: products.type,
      priceCents: products.priceCents,
      stock: products.stock,
      imageUrl: products.imageUrl,
      isFeatured: products.isFeatured,
      isSale: products.isSale,
      isActive: products.isActive,
      isWysiwyg: products.isWysiwyg,
      description: products.description,
      careInstructions: products.careInstructions,
      specs: products.specs,
      updatedAt: products.updatedAt,
      categoryName: categories.name,
    }).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).orderBy(desc(products.updatedAt)),
    db.select({ id: categories.id, name: categories.name }).from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.displayOrder)),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="border-b border-slate-800 pb-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Catálogo administrado</p><h1 className="mt-1 text-3xl font-black text-white">Productos e inventario</h1><p className="mt-2 text-sm text-slate-400">Edita fichas de arrecife y ajusta el stock al instante, sin recargar la página.</p></header>
      <ProductsManager key={`${edit ?? 'list'}:${productRows.map((product) => `${product.id}-${product.stock}-${product.updatedAt}`).join('|')}`} products={productRows} categories={categoryRows} initialEditId={edit} />
    </div>
  );
}
