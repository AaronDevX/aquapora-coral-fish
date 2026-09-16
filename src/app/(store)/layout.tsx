import { db, categories } from '@/db';
import { eq, asc } from 'drizzle-orm';
import { Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';

import { Suspense } from 'react';

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let activeCategories: { id: string; name: string; slug: string }[] = [];
  try {
    activeCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.displayOrder));
  } catch (error) {
    console.error('Error fetching categories for layout:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <Suspense
        fallback={
          <div className="bg-slate-950 border-b border-slate-800 h-24 flex items-center justify-between px-4 max-w-7xl mx-auto" />
        }
      >
        <Navbar categories={activeCategories.length > 0 ? activeCategories : undefined} />
      </Suspense>
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
