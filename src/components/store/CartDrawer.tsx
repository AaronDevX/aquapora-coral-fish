'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, getSubtotalCents } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!mounted) return null;
  if (!isOpen) return null;

  const subtotalCents = getSubtotalCents();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold tracking-wide text-white">Tu Carrito de Arrecife</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8 text-cyan-500/40" />
                </div>
                <p className="text-slate-300 font-medium">Tu carrito está vacío</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Explora nuestros corales SPS, LPS y peces selectos para comenzar tu arrecife.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-2 text-sm px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          href={`/producto/${item.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="text-sm font-semibold text-slate-200 hover:text-cyan-400 truncate transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {item.isWysiwyg && (
                        <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-800/40">
                          WYSIWYG - Pieza Única
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {item.isWysiwyg ? (
                        <span className="text-xs text-slate-400">Cant: 1 (Único)</span>
                      ) : (
                        <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                            aria-label="Disminuir"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                            aria-label="Aumentar"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <span className="text-sm font-bold text-cyan-400">
                        S/ {((item.priceCents * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-950/80 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Subtotal estimado</span>
                <span className="text-lg font-bold text-white">
                  S/ {(subtotalCents / 100).toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Los costos de flete refrigerado o courier local se coordinan al momento del pedido.
              </p>
              <div className="space-y-2">
                <Link
                  href="/catalogo"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium flex items-center justify-center transition-colors"
                >
                  Seguir Comprando
                </Link>
                <a
                  href={`https://wa.me/51947177997?text=${encodeURIComponent(
                    `Hola Aquapora, deseo confirmar mi pedido de ${items.length} producto(s) por un total de S/ ${(subtotalCents / 100).toFixed(2)}:\n` +
                      items.map((i) => `- ${i.name} (Cant: ${i.quantity})`).join('\n')
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <span>Pedir por WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
