'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useHydrated } from '@/lib/useHydrated';
import { CartDrawer } from './CartDrawer';
import {
  Fish,
  ShoppingBag,
  Search,
  Menu,
  X,
  Phone,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  categories?: { id: string; name: string; slug: string }[];
}

const defaultCategories = [
  { id: 'corales-sps', name: 'Corales SPS', slug: 'corales-sps' },
  { id: 'corales-lps', name: 'Corales LPS', slug: 'corales-lps' },
  { id: 'corales-blandos', name: 'Blandos y Zoas', slug: 'corales-blandos' },
  { id: 'peces-marinos', name: 'Peces Marinos', slug: 'peces-marinos' },
  { id: 'anemonas-invertebrados', name: 'Invertebrados', slug: 'anemonas-invertebrados' },
  { id: 'alimentos-aditivos', name: 'Aditivos y Alimento', slug: 'alimentos-aditivos' },
];

function NavbarInner({ categories = defaultCategories }: NavbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const mounted = useHydrated();

  const { getTotalItems, setIsOpen: setCartOpen } = useCartStore();

  // Update searchTerm when URL searchParam changes
  useEffect(() => {
    const currentBuscar = searchParams.get('buscar') || '';
    const timeoutId = window.setTimeout(() => setSearchTerm(currentBuscar), 0);
    return () => window.clearTimeout(timeoutId);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/catalogo?buscar=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/catalogo');
    }
    setMobileMenuOpen(false);
  };

  const totalCartItems = mounted ? getTotalItems() : 0;

  return (
    <>
      {/* Top Notice Bar */}
      <div className="bg-slate-900/90 border-b border-cyan-950/60 text-[11px] md:text-xs text-slate-300 py-1.5 px-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span className="font-medium tracking-wide">
              Envíos a todo el Perú | Animales vivos con empaque térmico especializado
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-400 shrink-0">
            <span className="flex items-center gap-1 hover:text-cyan-300 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Garantía Arribo Vivo 100%
            </span>
            <a
              href="https://wa.me/51947177997"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              +51 947 177 997
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group shrink-0"
              aria-label="AQUAPORA CORAL FISH - Inicio"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-blue-600 p-0.5 shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-400/30 transition-all duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Fish className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-wider text-white uppercase flex items-center gap-1.5 leading-tight">
                  Aquapora
                  <span className="text-[10px] font-semibold text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-800/50">
                    REEF
                  </span>
                </span>
                <span className="text-[10px] tracking-[0.2em] font-medium text-slate-400 uppercase">
                  Coral Fish · Perú
                </span>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="text"
                  placeholder="Buscar corales, peces, tipo (SPS, Acropora, payaso)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs lg:text-sm bg-slate-900/90 border border-slate-800 rounded-full text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/catalogo"
                className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-lg border border-cyan-900/60 bg-cyan-950/30 hover:bg-cyan-950/60 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Catálogo Arrecife
              </Link>

              {/* Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-400 transition-all flex items-center justify-center group"
                aria-label={`Ver carrito (${totalCartItems} productos)`}
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/40 animate-in fade-in zoom-in duration-200">
                    {totalCartItems > 99 ? '99+' : totalCartItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Categories Bar (Horizontal Scroll on Mobile/Tablet, Clean on Desktop) */}
          <nav
            aria-label="Categorías rápidas"
            className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-900/80 -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            <Link
              href="/catalogo"
              className="text-xs font-medium text-slate-400 hover:text-cyan-300 px-2.5 py-1 rounded-md hover:bg-slate-900 transition-colors shrink-0"
            >
              Todos
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalogo?categoria=${cat.slug}`}
                className="text-xs font-medium text-slate-300 hover:text-cyan-300 px-2.5 py-1 rounded-md hover:bg-slate-900/90 transition-colors shrink-0 border border-transparent hover:border-slate-800"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Cart Drawer Component */}
      <CartDrawer />

      {/* Mobile Lateral Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-slate-950 border-r border-slate-800 text-slate-100 flex flex-col shadow-2xl p-6">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Fish className="w-6 h-6 text-cyan-400" />
                <span className="font-extrabold tracking-wider text-base uppercase text-white">
                  Aquapora Coral
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="mt-5">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Buscar en catálogo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </form>
            </div>

            {/* Drawer Nav Links */}
            <div className="flex-1 overflow-y-auto mt-6 space-y-1">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 px-3 mb-2">
                Categorías de Arrecife
              </p>
              <Link
                href="/catalogo"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-cyan-400 hover:bg-slate-900 transition-colors"
              >
                <span>Catálogo Completo</span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalogo?categoria=${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-cyan-400 hover:bg-slate-900 transition-colors"
                >
                  <span>{cat.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </Link>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-slate-800 space-y-3 text-xs text-slate-400">
              <a
                href="https://wa.me/51947177997"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 font-medium hover:bg-emerald-950/70 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Asesoría WhatsApp: +51 947 177 997</span>
              </a>
              <p className="text-[11px] text-slate-400 text-center">
                José Marti 275, Lima, Perú
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Navbar(props: NavbarProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-950 border-b border-slate-800 h-24 flex items-center justify-between px-4 max-w-7xl mx-auto">
          <div className="w-40 h-8 bg-slate-900 rounded animate-pulse" />
        </div>
      }
    >
      <NavbarInner {...props} />
    </Suspense>
  );
}
