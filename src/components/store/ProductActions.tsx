'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, MessageCircle, Minus, Plus, Check, AlertCircle } from 'lucide-react';
import type { Product } from '@/db/schema';

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const { addItem } = useCartStore();

  const isOutOfStock = product.stock <= 0;
  const isWysiwyg = product.isWysiwyg;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        priceCents: product.priceCents,
        imageUrl: product.imageUrl,
        maxStock: product.stock,
        isWysiwyg: product.isWysiwyg,
      },
      quantity
    );

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hola Aquapora, tengo dudas sobre el producto: ${product.name} (ID: ${product.id})`
  );
  const whatsappUrl = `https://wa.me/51947177997?text=${whatsappMessage}`;

  return (
    <div className="space-y-4 pt-2">
      {/* Stock status indicator */}
      <div className="flex items-center gap-2 text-xs">
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/70 border border-rose-800/60 text-rose-300 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            Agotado temporalmente
          </span>
        ) : isWysiwyg ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-800/60 text-purple-300 font-semibold">
            <Check className="w-3.5 h-3.5 text-purple-400" />
            Pieza Única en Stock (WYSIWYG)
          </span>
        ) : product.stock <= 3 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/70 border border-amber-800/60 text-amber-300 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            ¡Solo quedan {product.stock} disponibles!
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 font-semibold">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Stock disponible ({product.stock} unidades)
          </span>
        )}
      </div>

      {/* Quantity Selector & Add to Cart */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {!isWysiwyg && !isOutOfStock && (
          <div className="flex items-center justify-between border border-slate-800 rounded-xl bg-slate-900/90 px-3 py-2.5 sm:w-36">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-slate-100">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              disabled={quantity >= product.stock}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-500 hover:from-cyan-400 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/20 transition-all active:scale-[0.98]"
        >
          {addedAnimation ? (
            <>
              <Check className="w-5 h-5 text-slate-950" />
              <span>¡Agregado al Carrito!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              <span>{isOutOfStock ? 'Agotado' : 'Agregar al Carrito'}</span>
            </>
          )}
        </button>
      </div>

      {/* WhatsApp Live Advice Deep Link */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-emerald-800/50 hover:border-emerald-500/80 text-emerald-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md group"
      >
        <div className="p-1 rounded-md bg-emerald-950 text-emerald-400 group-hover:scale-110 transition-transform">
          <MessageCircle className="w-4 h-4" />
        </div>
        <span>¿Dudas sobre esta pieza? Pregúntanos en vivo</span>
      </a>
    </div>
  );
}
