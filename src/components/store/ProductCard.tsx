'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { DifficultyBadge } from './MarineSpecsBadge';
import type { Product } from '@/db/schema';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      imageUrl: product.imageUrl,
      maxStock: product.stock,
      isWysiwyg: product.isWysiwyg,
    });
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-950/30 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image container with square aspect ratio */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-950">
        <Link href={`/producto/${product.slug}`} className="block w-full h-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            priority={false}
          />
        </Link>

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isWysiwyg && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-900/90 text-purple-200 border border-purple-500/50 backdrop-blur-md shadow-lg shadow-purple-950/50">
              <Sparkles className="w-3 h-3 text-purple-300" />
              WYSIWYG · Pieza Única
            </span>
          )}
          {product.isSale && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600/90 text-white border border-rose-400/50 backdrop-blur-md shadow-md">
              Oferta
            </span>
          )}
        </div>

        {/* Difficulty Badge - Top Right */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <DifficultyBadge difficulty={product.specs?.difficulty} />
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-20">
            <span className="px-3 py-1 bg-slate-900/90 border border-slate-700 text-slate-300 text-xs font-bold uppercase rounded-lg">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Coral / Specimen Type */}
          <span className="text-[11px] font-semibold text-cyan-400/90 uppercase tracking-wider">
            {product.type}
          </span>

          {/* Product Name */}
          <h3 className="mt-1 text-sm sm:text-base font-bold text-slate-100 group-hover:text-cyan-300 line-clamp-2 transition-colors">
            <Link href={`/producto/${product.slug}`}>
              {product.name}
            </Link>
          </h3>

          {/* Scientific Name (if available) */}
          {product.scientificName && (
            <p className="text-[11px] italic text-slate-400 truncate mt-0.5">
              {product.scientificName}
            </p>
          )}
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Precio
            </span>
            <span className="text-base sm:text-lg font-black text-cyan-300">
              S/ {(product.priceCents / 100).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/producto/${product.slug}`}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-center"
              title="Ver detalles"
              aria-label={`Ver detalles de ${product.name}`}
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20 active:scale-95"
              aria-label={`Agregar ${product.name} al carrito`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agregar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
