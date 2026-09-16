'use client';

import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Heart, Home, Menu, Search, ShoppingCart, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useHydrated } from '@/lib/useHydrated';
import { CATALOG_CATEGORIES, normalizeCategory, STORE_NAV } from '@/lib/store-config';
import { cn, formatSoles } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { CartDrawer } from './CartDrawer';

function SearchForm({ query, onNavigate }: { query: string; onNavigate: () => void }) {
  const router = useRouter();
  return <form role="search" className="store-search" onSubmit={(event) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get('buscar') ?? '').trim();
    router.push(value ? `/catalogo?buscar=${encodeURIComponent(value)}` : '/catalogo');
    onNavigate();
  }}>
    <input key={query} type="search" name="buscar" defaultValue={query} aria-label="Buscar productos"
      placeholder="Buscar productos, marcas y más..." maxLength={150} />
    <button type="submit" aria-label="Buscar"><Search size={22} /></button>
  </form>;
}

function NavbarInner() {
  const pathname = usePathname();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const setCartOpen = useCartStore((state) => state.setIsOpen);
  const favoriteCount = useWishlistStore((state) => state.ids.length);
  const count = hydrated ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const total = hydrated ? items.reduce((sum, item) => sum + item.quantity * item.priceCents, 0) : 0;
  const category = normalizeCategory(params.get('categoria') ?? params.get('cat') ?? '');
  const activeCategory = CATALOG_CATEGORIES.find((item) => item.slug === category || item.ids.includes(category))?.slug ?? category;
  const sale = params.get('ofertas') === 'true' || params.get('sale') === '1';

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === 'aquapora-wishlist-storage' || event.key === null) void useWishlistStore.persist.rehydrate();
      if (event.key === 'aquapora-cart-storage' || event.key === null) void useCartStore.persist.rehydrate();
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  function isActive(href: string) {
    if (!href.includes('?')) return pathname === href;
    if (pathname !== '/catalogo') return false;
    return href.includes('ofertas=') ? sale : !sale && href.endsWith(`categoria=${activeCategory}`);
  }
  const links = STORE_NAV.map(({ name, href }) => <Link key={href} href={href}
    onClick={() => setMenuOpen(false)} aria-current={isActive(href) ? 'page' : undefined}
    className={cn('store-nav-link', isActive(href) && 'active')}>
    {href === '/' && <Home size={13} aria-hidden="true" />}{name}
  </Link>);

  return <>
    <header className="store-header">
      <div className="store-header-main">
        <Link href="/" className="store-logo" aria-label="AQUAPORA CORAL FISH - Inicio">
          <Image src="/assets/aquapora-logo-circular.png" alt="AQUAPORA CORAL FISH" width={100} height={100} priority />
        </Link>
        <SearchForm query={params.get('buscar') ?? ''} onNavigate={() => setMenuOpen(false)} />
        <div className="store-header-actions">
          <Link href="/favoritos" className="store-action" aria-label={`Favoritos (${hydrated ? favoriteCount : 0} guardados)`}>
            <Heart size={27} strokeWidth={1.8} /><span className="store-action-copy">Favoritos<small aria-live="polite">{hydrated ? favoriteCount : 0} guardados</small></span>
          </Link>
          <button type="button" className="store-action" onClick={() => { setMenuOpen(false); setCartOpen(true); }} aria-label={`Carrito (${count} productos, ${formatSoles(total)})`}>
            <ShoppingCart size={27} strokeWidth={1.8} /><span className="store-action-copy">Carrito<small aria-live="polite">{formatSoles(total)}</small></span>
            <span className="store-cart-count">{count > 99 ? '99+' : count}</span>
          </button>
          <button className="store-menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Abrir menú" aria-expanded={menuOpen} aria-controls="mobile-navigation"><Menu size={25} /></button>
        </div>
      </div>
      <nav className="store-navigation scrollbar-none" aria-label="Navegación principal"><div>{links}</div></nav>
    </header>
    <CartDrawer />
    <Modal open={menuOpen} onClose={() => setMenuOpen(false)} titleId="mobile-menu-title">
      <section id="mobile-navigation" className="h-full w-[min(85vw,360px)] overflow-y-auto bg-white p-6 text-[#102b58]">
        <div className="mb-6 flex items-center justify-between"><h2 id="mobile-menu-title" className="font-bold">AQUAPORA CORAL FISH</h2><button onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" className="p-2"><X /></button></div>
        <nav className="store-mobile-links" aria-label="Navegación móvil">{links}</nav>
      </section>
    </Modal>
  </>;
}

export function Navbar() {
  return <Suspense fallback={<div className="h-[156px] bg-white" />}><NavbarInner /></Suspense>;
}
