import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db, products } from '@/db';
import { eq, and, ne } from 'drizzle-orm';
import { ProductGallery } from '@/components/store/ProductGallery';
import { ProductActions } from '@/components/store/ProductActions';
import { MarineSpecsBadge } from '@/components/store/MarineSpecsBadge';
import { ProductCard } from '@/components/store/ProductCard';
import {
  ChevronRight,
  ShieldCheck,
  Truck,
  Droplets,
  BookOpen,
  Sparkles,
  Info,
} from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60; // ISR 60s

// Generate dynamic SEO metadata
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await db.query.products.findFirst({
    where: (p, { eq, and }) => and(eq(p.slug, slug), eq(p.isActive, true)),
  });

  if (!product) {
    return {
      title: 'Producto no encontrado | AQUAPORA CORAL FISH',
      description: 'El ejemplar marino solicitado no se encuentra disponible.',
    };
  }

  const cleanDescription =
    product.description ||
    `Ejemplar de ${product.name} disponible en Aquapora Coral Fish Perú con garantía de llegada viva.`;

  return {
    title: `${product.name} | AQUAPORA CORAL FISH`,
    description: cleanDescription.slice(0, 160),
    openGraph: {
      title: `${product.name} | AQUAPORA CORAL FISH`,
      description: cleanDescription.slice(0, 160),
      images: [
        {
          url: product.imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  // 1. Fetch product with category relation
  const product = await db.query.products.findFirst({
    where: (p, { eq, and }) => and(eq(p.slug, slug), eq(p.isActive, true)),
    with: {
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  // 2. Fetch related products from same category
  const relatedProducts = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.categoryId, product.categoryId),
        eq(products.isActive, true),
        ne(products.id, product.id)
      )
    )
    .limit(4);

  // Chemical baseline parameters with product overrides
  const chemicalParameters = [
    {
      param: 'Temperatura',
      value: product.specs?.temperatura || '24°C - 26°C',
      ideal: '25.0°C',
    },
    {
      param: 'Salinidad',
      value: product.specs?.salinidad || '1.025 SG (35 ppt)',
      ideal: '1.025 SG',
    },
    {
      param: 'Alcalinidad (kH)',
      value: product.specs?.kh || '7.5 - 9.0 dKH',
      ideal: '8.0 dKH',
    },
    {
      param: 'Calcio (Ca)',
      value: product.specs?.calcio || '420 - 450 ppm',
      ideal: '430 ppm',
    },
    {
      param: 'Magnesio (Mg)',
      value: product.specs?.magnesio || '1300 - 1350 ppm',
      ideal: '1350 ppm',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs text-slate-400 overflow-x-auto pb-1">
        <Link href="/" className="hover:text-cyan-400 transition-colors shrink-0">
          Inicio
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <Link href="/catalogo" className="hover:text-cyan-400 transition-colors shrink-0">
          Catálogo
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <Link
              href={`/catalogo?categoria=${product.category.slug}`}
              className="hover:text-cyan-400 transition-colors shrink-0"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="text-slate-200 font-semibold truncate">
          {product.name}
        </span>
      </nav>

      {/* Main Specimen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Left Column: Gallery & Tech Specs Badges */}
        <div className="lg:col-span-6 space-y-6">
          <ProductGallery
            name={product.name}
            imageUrl={product.imageUrl}
            additionalImages={product.additionalImages || []}
            isWysiwyg={product.isWysiwyg}
          />

          {/* Quick Technical Specs Badges */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Requerimientos Básicos de Acuario
            </h4>
            <MarineSpecsBadge specs={product.specs} size="md" />
          </div>
        </div>

        {/* Right Column: Specimen Details, Pricing, Actions & Chemistry */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header & Taxonomy */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                {product.type}
              </span>
              {product.category && (
                <span className="text-xs text-slate-400">
                  en {product.category.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            {product.scientificName && (
              <p className="text-sm italic text-slate-400">
                {product.scientificName}
              </p>
            )}
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">
                Precio de Colección
              </span>
              <span className="text-3xl font-black text-cyan-300 tracking-tight">
                S/ {(product.priceCents / 100).toFixed(2)}
              </span>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <span>Incluye IGV</span>
              <span className="block text-slate-400">Comprobante fiscal con RUC</span>
            </div>
          </div>

          {/* Interactive Actions (Quantity, Add to Cart, WhatsApp Inquiry) */}
          <ProductActions product={product} />

          {/* Security & Live Arrival Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-slate-200 block">Arribo Vivo 100%</span>
                <span className="text-[11px] text-slate-400">Garantía total en envíos</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-slate-200 block">Envío Térmico</span>
                <span className="text-[11px] text-slate-400">Oxígeno + aislamiento</span>
              </div>
            </div>
          </div>

          {/* Ficha Química de Arrecife */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wide">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>Parámetros Químicos Recomendados</span>
              </div>
              <span className="text-[10px] text-slate-400">Arrecife Estable</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2 font-semibold">Parámetro</th>
                    <th className="py-2 font-semibold">Rango Seguro</th>
                    <th className="py-2 font-semibold text-right">Valor Ideal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                  {chemicalParameters.map((param) => (
                    <tr key={param.param} className="hover:bg-slate-850/30">
                      <td className="py-2.5 text-slate-200">{param.param}</td>
                      <td className="py-2.5 font-mono text-cyan-300">{param.value}</td>
                      <td className="py-2.5 text-right font-mono text-slate-400">{param.ideal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cuidados Específicos */}
          {product.careInstructions && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Info className="w-4 h-4" />
                <span>Instrucciones de Aclimatación y Cuidado</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                {product.careInstructions}
              </p>
            </div>
          )}

          {/* Descripción Biológica */}
          {product.description && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Descripción Biológica del Ejemplar</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ejemplares Relacionados */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block">
                Variedades Afines
              </span>
              <h2 className="text-2xl font-black text-white uppercase mt-1">
                Otros Ejemplares de la Misma Categoría
              </h2>
            </div>
            {product.category && (
              <Link
                href={`/catalogo?categoria=${product.category.slug}`}
                className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Ver más en {product.category.name} →
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
