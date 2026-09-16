'use client';

import Image from 'next/image';
import { FormEvent, useState, useTransition } from 'react';
import { ImagePlus, LoaderCircle, Save, X } from 'lucide-react';
import { upsertProductAction } from '@/actions/adminActions';
import { uploadProductImageAction } from '@/actions/uploadActions';

export type AdminCategory = { id: string; name: string };
export type AdminProduct = {
  id: string;
  name: string;
  scientificName: string | null;
  categoryId: string;
  type: string;
  priceCents: number;
  stock: number;
  imageUrl: string;
  isFeatured: boolean;
  isSale: boolean;
  isActive: boolean;
  isWysiwyg: boolean;
  description: string;
  careInstructions: string;
  specs: {
    difficulty: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto';
    lighting: 'Baja' | 'Media' | 'Alta' | 'Muy Alta (PAR 250+)';
    flow: 'Suave' | 'Moderado' | 'Fuerte / Turbulento';
    placement: 'Fondo / Arena' | 'Tercio Medio' | 'Tercio Superior';
    kh?: string;
    calcio?: string;
    magnesio?: string;
  };
};

type Props = {
  product?: AdminProduct;
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: () => void;
};

const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15';
const labelClass = 'block text-xs font-bold text-slate-300';

export function ProductFormDialog({ product, categories, onClose, onSaved }: Props) {
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '');
  const [previewUrl, setPreviewUrl] = useState(product?.imageUrl ?? '');

  async function uploadImage(file: File) {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.set('image', file);
    const result = await uploadProductImageAction(formData);
    setUploading(false);
    if (!result.success || !result.url) {
      setError(result.error ?? 'No se pudo subir la imagen.');
      return;
    }
    setImageUrl(result.url);
    setPreviewUrl(result.url);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!imageUrl) {
      setError('Sube una imagen antes de guardar el producto.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set('imageUrl', imageUrl);
    startTransition(async () => {
      const result = await upsertProductAction(formData);
      if (!result.success) {
        setError(result.error ?? 'No se pudo guardar el producto.');
        return;
      }
      onSaved();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
      <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border border-slate-700 bg-slate-900 shadow-2xl sm:rounded-3xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-5 py-4 backdrop-blur sm:px-7">
          <div><p className="text-xs font-bold uppercase tracking-wider text-cyan-400">Inventario</p><h2 id="product-dialog-title" className="mt-0.5 text-xl font-black text-white">{product ? 'Editar producto' : 'Nuevo producto'}</h2></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Cerrar formulario"><X className="h-5 w-5" /></button>
        </header>

        <form onSubmit={submit} className="space-y-7 p-5 sm:p-7">
          <input type="hidden" name="id" value={product?.id ?? ''} />
          <section className="grid gap-5 md:grid-cols-[190px_1fr]">
            <div>
              <p className={labelClass}>Foto principal</p>
              <label className="relative mt-1.5 flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-600 bg-slate-950 text-center transition hover:border-cyan-400 hover:bg-cyan-500/5">
                {previewUrl ? <Image src={previewUrl} alt="Vista previa del producto" fill unoptimized className="object-cover" /> : <><ImagePlus className="h-7 w-7 text-cyan-400" /><span className="mt-2 px-4 text-xs font-semibold text-slate-400">Seleccionar imagen</span></>}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={uploading || pending} onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setPreviewUrl(URL.createObjectURL(file));
                  void uploadImage(file);
                }} />
              </label>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-500">JPG, PNG, WebP o AVIF; máximo 8 MB. Se optimiza y convierte a WebP.</p>
              {uploading && <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-cyan-300"><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Subiendo a Cloudinary…</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={`${labelClass} sm:col-span-2`}>Nombre<input required name="name" defaultValue={product?.name} className={inputClass} placeholder="Ej. Acropora Millepora Sunset" /></label>
              <label className={labelClass}>Nombre científico<input name="scientificName" defaultValue={product?.scientificName ?? ''} className={inputClass} placeholder="Acropora millepora" /></label>
              <label className={labelClass}>Tipo<input required name="type" defaultValue={product?.type} className={inputClass} placeholder="SPS Frag, pez, aditivo…" /></label>
              <label className={labelClass}>Categoría<select required name="categoryId" defaultValue={product?.categoryId ?? ''} className={inputClass}><option value="" disabled>Seleccionar categoría</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
              <label className={labelClass}>Precio (S/)<input required min="0" step="0.01" type="number" name="price" defaultValue={product ? (product.priceCents / 100).toFixed(2) : ''} className={inputClass} placeholder="0.00" /></label>
              <label className={labelClass}>Stock inicial / actual<input required min="0" step="1" type="number" name="stock" defaultValue={product?.stock ?? 0} className={inputClass} /></label>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>Descripción<textarea name="description" defaultValue={product?.description} rows={3} className={inputClass} placeholder="Descripción comercial y estado del ejemplar." /></label>
            <label className={`${labelClass} sm:col-span-2`}>Indicaciones de cuidado<textarea name="careInstructions" defaultValue={product?.careInstructions} rows={3} className={inputClass} placeholder="Aclimatación, alimentación y cuidados recomendados." /></label>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:p-5">
            <h3 className="text-sm font-black text-white">Parámetros marinos</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className={labelClass}>Dificultad<select name="difficulty" defaultValue={product?.specs.difficulty ?? 'Intermedio'} className={inputClass}>{['Principiante', 'Intermedio', 'Avanzado', 'Experto'].map((value) => <option key={value}>{value}</option>)}</select></label>
              <label className={labelClass}>Iluminación PAR<select name="lighting" defaultValue={product?.specs.lighting ?? 'Media'} className={inputClass}>{['Baja', 'Media', 'Alta', 'Muy Alta (PAR 250+)'].map((value) => <option key={value}>{value}</option>)}</select></label>
              <label className={labelClass}>Flujo<select name="flow" defaultValue={product?.specs.flow ?? 'Moderado'} className={inputClass}>{['Suave', 'Moderado', 'Fuerte / Turbulento'].map((value) => <option key={value}>{value}</option>)}</select></label>
              <label className={labelClass}>Posición en roca<select name="placement" defaultValue={product?.specs.placement ?? 'Tercio Medio'} className={inputClass}>{['Fondo / Arena', 'Tercio Medio', 'Tercio Superior'].map((value) => <option key={value}>{value}</option>)}</select></label>
              <label className={labelClass}>kH<input name="kh" defaultValue={product?.specs.kh ?? ''} className={inputClass} placeholder="8.0 dKH" /></label>
              <label className={labelClass}>Ca<input name="calcio" defaultValue={product?.specs.calcio ?? ''} className={inputClass} placeholder="430 ppm" /></label>
              <label className={labelClass}>Mg<input name="magnesio" defaultValue={product?.specs.magnesio ?? ''} className={inputClass} placeholder="1350 ppm" /></label>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['isWysiwyg', 'Pieza única WYSIWYG', product?.isWysiwyg ?? false],
              ['isFeatured', 'Producto destacado', product?.isFeatured ?? false],
              ['isSale', 'Producto en oferta', product?.isSale ?? false],
              ['isActive', 'Visible en tienda', product?.isActive ?? true],
            ].map(([name, label, defaultChecked]) => <label key={String(name)} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-xs font-bold text-slate-200"><span>{label}</span><input type="checkbox" name={String(name)} defaultChecked={Boolean(defaultChecked)} className="h-4 w-4 accent-cyan-400" /></label>)}
          </section>

          {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-200">{error}</p>}
          <footer className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={pending || uploading} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white">Cancelar</button>
            <button type="submit" disabled={pending || uploading} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">{pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{pending ? 'Guardando…' : 'Guardar producto'}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
