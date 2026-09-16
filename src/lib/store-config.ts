export const STORE = {
  name: 'AQUAPORA CORAL FISH',
  legalName: 'AQUAPORA WORLD TRADING S.A.C.',
  ruc: '20611125543',
  address: 'José Marti 275, Lima, Perú',
  phone: '+51 947 177 997',
  whatsapp: 'https://wa.me/51947177997',
};

export const CATALOG_CATEGORIES = [
  { slug: 'corales', name: 'Corales', ids: ['corales-sps', 'corales-lps', 'corales-blandos'] },
  { slug: 'peces', name: 'Peces', ids: ['peces-marinos'] },
  { slug: 'anemonas', name: 'Anémonas', ids: ['anemonas'] },
  { slug: 'invertebrados', name: 'Invertebrados', ids: ['invertebrados'] },
  { slug: 'accesorios', name: 'Accesorios', ids: ['accesorios'] },
  { slug: 'alimentos', name: 'Alimentos', ids: ['alimentos-aditivos'] },
];

export function firstQueryValue(value: string | string[] | undefined): string { return (Array.isArray(value) ? value[0] : value) ?? ''; }

export function normalizeCategory(value: string | string[] = ''): string {
  return firstQueryValue(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function categoryIds(value: string): string[] {
  const slug = normalizeCategory(value);
  if (slug === 'anemonas-invertebrados') return ['anemonas', 'invertebrados', slug];
  return CATALOG_CATEGORIES.find((item) => item.slug === slug)?.ids ?? [slug];
}

export const STORE_NAV = [
  { name: 'Inicio', href: '/' },
  ...CATALOG_CATEGORIES.map(({ name, slug }) => ({ name, href: `/catalogo?categoria=${slug}` })),
  { name: 'Ofertas', href: '/catalogo?ofertas=true' },
  { name: 'Favoritos', href: '/favoritos' },
  { name: 'Contacto', href: '/contacto' },
];
