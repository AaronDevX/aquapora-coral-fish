import { WishlistGrid } from '@/components/store/WishlistGrid';
export const metadata = { title: 'Favoritos | AQUAPORA CORAL FISH' };

export default function FavoritesPage() {
  return <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-bold">Mis favoritos</h1><p className="mb-8 mt-3 text-slate-400">Tu selección de vida marina y productos para el arrecife.</p>
    <WishlistGrid />
  </section>;
}
