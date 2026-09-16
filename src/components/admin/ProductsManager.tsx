'use client';

import Image from 'next/image';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, LoaderCircle, Minus, PackagePlus, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { deleteProductAction, updateStockAction } from '@/actions/adminActions';
import { ProductFormDialog, type AdminCategory, type AdminProduct } from './ProductFormDialog';

type ProductWithCategory = AdminProduct & { categoryName: string | null };
type Props = { products: ProductWithCategory[]; categories: AdminCategory[]; initialEditId?: string };

export function ProductsManager({ products, categories, initialEditId }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const initialDialogProduct = initialEditId ? products.find((item) => item.id === initialEditId) : undefined;
  const [items, setItems] = useState(products);
  const [dialogProduct, setDialogProduct] = useState<AdminProduct | undefined>(initialDialogProduct);
  const [dialogOpen, setDialogOpen] = useState(Boolean(initialDialogProduct));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => items.filter((product) => {
    const haystack = `${product.name} ${product.scientificName ?? ''} ${product.type}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) &&
      (categoryId === 'all' || product.categoryId === categoryId) &&
      (status === 'all' || (status === 'active' ? product.isActive : !product.isActive));
  }), [items, query, categoryId, status]);

  function changeStock(product: ProductWithCategory, delta: number) {
    const nextStock = Math.max(0, product.stock + delta);
    if (nextStock === product.stock) return;
    setBusyId(product.id); setMessage(null);
    startTransition(async () => {
      const result = await updateStockAction(product.id, nextStock);
      setBusyId(null);
      if (!result.success) { setMessage(result.error ?? 'No se pudo actualizar el stock.'); return; }
      setItems((current) => current.map((item) => item.id === product.id ? { ...item, stock: result.stock ?? nextStock } : item));
      router.refresh();
    });
  }

  function deactivate(product: ProductWithCategory) {
    if (!window.confirm(`¿Desactivar “${product.name}”? Ya no se mostrará en la tienda.`)) return;
    setBusyId(product.id); setMessage(null);
    startTransition(async () => {
      const result = await deleteProductAction(product.id);
      setBusyId(null);
      if (!result.success) { setMessage(result.error ?? 'No se pudo desactivar el producto.'); return; }
      setItems((current) => current.map((item) => item.id === product.id ? { ...item, isActive: false } : item));
      router.refresh();
    });
  }

  function closeDialog() { setDialogOpen(false); setDialogProduct(undefined); router.replace('/admin/productos'); }
  function saved() { closeDialog(); router.refresh(); }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, especie o tipo…" className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-400" /></label>
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-400"><option value="all">Todas las categorías</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select>
        <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-400"><option value="all">Todos los estados</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select>
        <button type="button" onClick={() => { setDialogProduct(undefined); setDialogOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-cyan-300"><PackagePlus className="h-4 w-4" />Nuevo producto</button>
      </div>
      {message && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-200">{message}</p>}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70"><div className="overflow-x-auto"><table className="min-w-[850px] w-full text-left text-sm"><thead className="bg-slate-950/60 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Producto</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Precio</th><th className="px-4 py-3">Stock rápido</th><th className="px-4 py-3">Estado</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-800">{filtered.map((product) => { const busy = busyId === product.id || pending; return <tr key={product.id} className="hover:bg-slate-800/30"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><Image src={product.imageUrl} alt="" width={40} height={40} unoptimized className="h-10 w-10 rounded-lg border border-slate-700 object-cover" /><div><p className="font-bold text-slate-200">{product.name}</p><p className="text-xs text-slate-500">{product.scientificName || product.type}</p></div></div></td><td className="px-4 py-3.5 text-xs text-slate-400">{product.categoryName ?? '—'}</td><td className="px-4 py-3.5 font-semibold text-slate-200">S/ {(product.priceCents / 100).toFixed(2)}</td><td className="px-4 py-3.5"><div className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-950"><button aria-label="Reducir stock" disabled={busy || product.stock === 0} onClick={() => changeStock(product, -1)} className="p-2 text-slate-400 hover:text-rose-300 disabled:opacity-30"><Minus className="h-3.5 w-3.5" /></button><span className={`min-w-10 text-center text-sm font-black ${product.stock <= 3 ? 'text-amber-300' : 'text-cyan-300'}`}>{busy ? <LoaderCircle className="mx-auto h-3.5 w-3.5 animate-spin" /> : product.stock}</span><button aria-label="Aumentar stock" disabled={busy} onClick={() => changeStock(product, 1)} className="p-2 text-slate-400 hover:text-emerald-300 disabled:opacity-30"><Plus className="h-3.5 w-3.5" /></button></div></td><td className="px-4 py-3.5"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${product.isActive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>{product.isActive ? 'Activo' : 'Inactivo'}</span></td><td className="px-5 py-3.5"><div className="flex justify-end gap-1"><button type="button" title="Editar" onClick={() => { setDialogProduct(product); setDialogOpen(true); }} className="rounded-lg p-2 text-cyan-300 hover:bg-cyan-500/10"><Pencil className="h-4 w-4" /></button><button type="button" title="Desactivar" disabled={busy || !product.isActive} onClick={() => deactivate(product)} className="rounded-lg p-2 text-rose-300 hover:bg-rose-500/10 disabled:opacity-30">{product.isActive ? <Trash2 className="h-4 w-4" /> : <Archive className="h-4 w-4" />}</button></div></td></tr>; })}</tbody></table></div>{filtered.length === 0 && <p className="px-5 py-12 text-center text-sm text-slate-500">No hay productos que coincidan con los filtros.</p>}</div>

      {dialogOpen && <ProductFormDialog key={dialogProduct?.id ?? 'new'} product={dialogProduct} categories={categories} onClose={closeDialog} onSaved={saved} />}
    </div>
  );
}
