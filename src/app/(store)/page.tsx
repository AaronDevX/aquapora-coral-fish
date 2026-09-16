import Link from 'next/link';
import Image from 'next/image';
import { db, products, categories } from '@/db';
import { eq, and, desc, asc } from 'drizzle-orm';
import { ProductCard } from '@/components/store/ProductCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ThermometerSnowflake,
  Microscope,
  Waves,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export const revalidate = 60; // ISR cache revalidation every 60 seconds

// Category image map for visually stunning category cards
const categoryImageMap: Record<string, string> = {
  'corales-sps':
    'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=800&q=80',
  'corales-lps':
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'corales-blandos':
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
  'peces-marinos':
    'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80',
  'anemonas':
    'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&w=800&q=80',
  'alimentos-aditivos':
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
};

export default async function HomePage() {
  // 1. Fetch featured products
  const featuredProducts = await db
    .select()
    .from(products)
    .where(and(eq(products.isFeatured, true), eq(products.isActive, true)))
    .orderBy(desc(products.createdAt))
    .limit(8);

  // 2. Fetch active categories
  const activeCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.displayOrder));

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Banner Inmersivo de Arrecife */}
      <section className="relative min-h-[600px] lg:min-h-[680px] flex items-center justify-center overflow-hidden border-b border-cyan-950/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Background glow effects and reef lights */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(6,182,212,0.25),rgba(2,6,23,0))]" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#082f4915_1px,transparent_1px),linear-gradient(to_bottom,#082f4915_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8 z-10">
          {/* Tag pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-cyan-950/40">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tienda Especializada en Acuariofilia Marina de Arrecife</span>
          </div>

          {/* Impact Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.08]">
            Especialistas en{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
              Arrecife Marino
            </span>{' '}
            y Corales Selectos
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Corales SPS y LPS de colección, peces cuarentenados y fauna marina de la más alta
            calidad. Empaque térmico con oxígeno medicinal y garantía 100% de llegada viva a todo el Perú.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/catalogo"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Explorar Catálogo Marino</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/catalogo?categoria=corales-sps"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 backdrop-blur-md transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Ver Corales WYSIWYG</span>
            </Link>
          </div>

          {/* Key Metrics / Trust Pills */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Garantía</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Llegada viva certificada</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <ThermometerSnowflake className="w-4 h-4" />
                <span>Control Térmico</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Empaque con heat pack / O2</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Microscope className="w-4 h-4" />
                <span>Cuarentena</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Aclimatación y salud biológica</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Waves className="w-4 h-4" />
                <span>WYSIWYG</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Lo que ves es lo que recibes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías Principales */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
              <Compass className="w-4 h-4" />
              <span>Navegación Especializada</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase mt-1">
              Categorías de Arrecife
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCategories.map((category) => {
            const bgImage =
              categoryImageMap[category.id] ||
              'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=800&q=80';

            return (
              <Link
                key={category.id}
                href={`/catalogo?categoria=${category.slug}`}
                className="group relative h-64 rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/60 shadow-lg hover:shadow-cyan-950/40 transition-all duration-300 flex flex-col justify-end p-6"
              >
                {/* Background Image */}
                <Image
                  src={bgImage}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                {/* Content */}
                <div className="relative z-10 space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 backdrop-blur-sm">
                    Explorar
                  </span>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Piezas Destacadas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Selección Exclusiva</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase mt-1">
              Piezas Destacadas
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
          >
            <span>Ver todos los ejemplares</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm">
              Pronto añadiremos nuevas piezas destacadas a la colección.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Banner de Confianza y Arribo Vivo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-cyan-900/50 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/60 p-8 sm:p-12 lg:p-16">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-700/50 text-teal-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Protocolo de Bioseguridad y Envíos</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Garantía de Llegada Viva (Live Arrival Guarantee)
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              Entendemos el valor y la fragilidad de la vida marina. Todos nuestros animales son
              enviados en contenedores térmicos con control de temperatura, doble embolsado y oxígeno puro medicinal. Si algún ejemplar sufre percances durante el viaje, reponemos la pieza inmediatamente.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Empaque térmico con bolsas de oxígeno medicinal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Cuarentena preventiva de mínimo 21 días</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Asesoría directa en aclimatación por goteo</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Envíos aéreos y terrestres a todo el Perú</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <a
                href="https://wa.me/51947177997?text=Hola%20Aquapora,%20quisiera%20conocer%20más%20sobre%20el%20protocolo%20de%20envíos%20y%20garantía%20viva."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
              >
                <span>Consultar por WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/catalogo"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Ver Catálogo Disponible
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
