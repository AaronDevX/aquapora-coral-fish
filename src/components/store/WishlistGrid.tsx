'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useHydrated } from '@/lib/useHydrated';
import { getFavoriteProducts } from '@/actions/wishlistActions';
import type { Product } from '@/db/schema';
import { ProductCard } from './ProductCard';

export function WishlistGrid() {
  const ids = useWishlistStore((state) => state.ids);
  const clear = useWishlistStore((state) => state.clearFavorites);
  const toggle = useWishlistStore((state) => state.toggleFavorite);
  const hydrated = useHydrated();
  const [attempt, setAttempt] = useState(0);
  const key = ids.join(',');
  const [result, setResult] = useState<{ key: string; products: Product[]; error: boolean } | null>(null);
  useEffect(() => {
    if (!hydrated || !key) return;
    let cancelled = false;
    getFavoriteProducts(key.split(',')).then((products) => {
      if (!cancelled) setResult({ key, products, error: false });
    }).catch(() => {
      if (!cancelled) setResult({ key, products: [], error: true });
    });
    return () => { cancelled = true; };
  }, [key, hydrated, attempt]);
  if (!hydrated) return <p role="status" className="py-12 text-slate-400">Cargando favoritos…</p>;
  if (!ids.length) return <div className="rounded-2xl border border-slate-800 p-12 text-center">
    <Heart className="mx-auto mb-4 h-12 w-12 text-cyan-400" /><h2 className="text-xl font-bold">Aún no tienes favoritos</h2>
    <p className="my-4 text-slate-400">Toca el corazón de un producto para guardarlo aquí.</p>
    <Link href="/catalogo" className="inline-block rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">Explorar catálogo</Link>
  </div>;
  const available = result?.key === key ? result : null;
  const missing = available && !available.error ? ids.filter((id) => !available.products.some((product) => product.id === id)) : [];
  return <>
    <div className="mb-6 flex items-center justify-between gap-4"><p aria-live="polite" className="text-slate-400">{ids.length} guardados</p>
      <button onClick={clear} className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm hover:text-rose-300"><Trash2 size={16} />Vaciar favoritos</button></div>
    {!available ? <p role="status" className="py-12 text-slate-400">Consultando disponibilidad…</p> : available.error ?
      <div role="alert"><p>No pudimos cargar tus favoritos.</p><button className="mt-3 text-cyan-300 underline" onClick={() => { setResult(null); setAttempt((value) => value + 1); }}>Reintentar</button></div> : <>
        {missing.length > 0 && <div className="mb-5 rounded-xl bg-slate-900 p-4 text-sm text-slate-300">{missing.length} productos ya no están disponibles. <button className="text-cyan-300 underline" onClick={() => missing.forEach(toggle)}>Quitar los no disponibles</button></div>}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{available.products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </>}
  </>;
}
