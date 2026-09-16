import { CATALOG_CATEGORIES, categoryIds, normalizeCategory, firstQueryValue } from '@/lib/store-config';
import { db, products, categories } from '@/db';
import { eq, and, or, ilike, asc, desc, sql, inArray, type SQL } from 'drizzle-orm';
import { ProductCard } from '@/components/store/ProductCard';
import { CatalogFilters } from '@/components/store/CatalogFilters';
import { Fish, Sparkles, FilterX } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

interface CatalogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 60; // ISR 60s

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const resolvedSearchParams = await searchParams;
  const dificultad = firstQueryValue(resolvedSearchParams.dificultad);
  const buscar = firstQueryValue(resolvedSearchParams.buscar).slice(0, 150);
  const orden = firstQueryValue(resolvedSearchParams.orden);
  const categoria = normalizeCategory(resolvedSearchParams.categoria ?? resolvedSearchParams.cat ?? '');
  const ofertas = firstQueryValue(resolvedSearchParams.ofertas) === 'true' || firstQueryValue(resolvedSearchParams.sale) === '1';

  // 1. Fetch all active categories for filter bar
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.displayOrder));

  // 2. Build where conditions
  const conditions: SQL[] = [eq(products.isActive, true)];

  if (categoria) {
    const requested = categoryIds(categoria);
    const ids = allCategories.filter((item) => requested.includes(item.id) || requested.includes(item.slug)).map((item) => item.id);
    conditions.push(ids.length ? inArray(products.categoryId, ids) : sql`false`);
  }
  if (ofertas) conditions.push(eq(products.isSale, true));

  // Difficulty filter (inside jsonb specs)
  if (dificultad) {
    conditions.push(sql`${products.specs}->>'difficulty' = ${dificultad}`);
  }

  // Text search filter
  if (buscar && buscar.trim()) {
    const searchPattern = `%${buscar.trim()}%`;
    conditions.push(
      or(
        ilike(products.name, searchPattern),
        ilike(products.type, searchPattern),
        ilike(products.scientificName, searchPattern)
      )!
    );
  }

  // Sorting
  let orderByClause = desc(products.createdAt);
  if (orden === 'precio-asc') {
    orderByClause = asc(products.priceCents);
  } else if (orden === 'precio-desc') {
    orderByClause = desc(products.priceCents);
  }

  // 3. Query filtered products
  const matchingProducts = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(orderByClause);

  const activeCategoryObj = CATALOG_CATEGORIES.find((item) => item.slug === categoria) ?? (categoria
    ? allCategories.find((c) => c.slug === categoria || c.id === categoria)
    : null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="mb-8 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
          <Fish className="w-4 h-4" />
          <span>Inventario Vivo & Colección de Arrecife</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {ofertas ? `Ofertas${activeCategoryObj ? ` · ${activeCategoryObj.name}` : ''}` : activeCategoryObj?.name ?? 'Catálogo General de Corales y Peces'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl">
              Ejemplares marinos sanos, aclimatados y cuarentenados con especificaciones técnicas de luz, flujo y requerimientos de acuario.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
              <strong className="text-cyan-400">{matchingProducts.length}</strong>{' '}
              {matchingProducts.length === 1 ? 'ejemplar encontrado' : 'ejemplares encontrados'}
            </span>
          </div>
        </div>
      </div>

      {/* Catalog Layout: Filters Sidebar + Products Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <Suspense
          fallback={
            <aside className="w-full lg:w-64 shrink-0">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse h-96" />
            </aside>
          }
        >
          <CatalogFilters key={`${categoria}:${buscar ?? ''}`} categories={[...CATALOG_CATEGORIES.map(({ slug, name }) => ({ id: slug, slug, name })), ...allCategories.filter((item) => item.slug.startsWith('corales-'))]} />
        </Suspense>

        {/* Results Area */}
        <div className="flex-1">
          {matchingProducts.length === 0 ? (
            <div className="text-center py-20 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                <FilterX className="w-8 h-8 text-cyan-500/40" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-200">
                  No se encontraron ejemplares con esos filtros
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md">
                  Prueba modificando la dificultad de cuidado, la categoría o el término de búsqueda para ver más ejemplares de nuestro arrecife.
                </p>
              </div>
              <Link
                href="/catalogo"
                className="mt-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-lg shadow-cyan-600/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ver todos los ejemplares</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {matchingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
