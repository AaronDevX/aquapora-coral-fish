'use client';

import { normalizeCategory, CATALOG_CATEGORIES } from '@/lib/store-config';
import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, RotateCcw, Check } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface CatalogFiltersProps {
  categories: CategoryItem[];
}

const difficulties = ['Principiante', 'Intermedio', 'Avanzado', 'Experto'];

const sortOptions = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'precio-asc', label: 'Menor precio' },
  { value: 'precio-desc', label: 'Mayor precio' },
];

export function CatalogFilters({ categories }: CatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const rawCategory = normalizeCategory(searchParams.get('categoria') ?? searchParams.get('cat') ?? '');
  const currentCategory = CATALOG_CATEGORIES.find((item) => item.ids.includes(rawCategory) && !rawCategory.startsWith('corales-'))?.slug ?? rawCategory;
  const sale = searchParams.get('ofertas') === 'true' || searchParams.get('sale') === '1';
  const currentDifficulty = searchParams.get('dificultad') || '';
  const currentSearch = searchParams.get('buscar') || '';
  const currentOrder = searchParams.get('orden') || 'recientes';

  const [searchInput, setSearchInput] = useState(currentSearch);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    if ('categoria' in updates) params.delete('cat');
    if ('ofertas' in updates) params.delete('sale');

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'recientes') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`/catalogo?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ buscar: searchInput.trim() });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    startTransition(() => {
      router.push('/catalogo');
    });
  };

  const hasActiveFilters = Boolean(
    sale || currentCategory || currentDifficulty || currentSearch || (currentOrder && currentOrder !== 'recientes')
  );

  const filterContent = (
    <div className="space-y-6">
      {/* Search Filter */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Búsqueda
        </label>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ej: Acropora, payaso..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                updateFilters({ buscar: null });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Categories Filter */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
          Categoría
        </label>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => updateFilters({ categoria: null })}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              !currentCategory
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <span>Todas las categorías</span>
            {!currentCategory && <Check className="w-3.5 h-3.5" />}
          </button>
          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => updateFilters({ categoria: isSelected ? null : cat.slug })}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-semibold'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span>{cat.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={sale} onChange={(event) => updateFilters({ ofertas: event.target.checked ? 'true' : null })} className="accent-cyan-400" />Solo ofertas</label>
      {/* Difficulty Filter */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
          Dificultad de Cuidado
        </label>
        <div className="flex flex-wrap gap-1.5">
          {difficulties.map((diff) => {
            const isSelected = currentDifficulty === diff;
            return (
              <button
                key={diff}
                onClick={() => updateFilters({ dificultad: isSelected ? null : diff })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-cyan-600 border-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-600/30'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {diff}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sorting Filter */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
          Ordenar Por
        </label>
        <select
          value={currentOrder}
          onChange={(e) => updateFilters({ orden: e.target.value })}
          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full py-2 px-3 rounded-xl border border-rose-900/50 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Filtros</span>
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <span>Filtrar Ejemplares</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300"
            title="Limpiar filtros"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-44 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wide">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>Filtros Arrecife</span>
            </div>
            {isPending && (
              <span className="text-[10px] text-cyan-400 animate-pulse">Filtrando...</span>
            )}
          </div>
          {filterContent}
        </div>
      </aside>

      {/* Mobile Filters Modal/Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-slate-950 border-l border-slate-800 p-6 flex flex-col z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <span>Filtros</span>
              </div>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {filterContent}
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider"
              >
                Ver Resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
