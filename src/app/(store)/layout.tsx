import { Navbar } from '@/components/store/Navbar';
import { Footer } from '@/components/store/Footer';

// Runtime inventory: clean builds need no database or production secrets.
export const dynamic = 'force-dynamic';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
    <Navbar />
    <main className="flex-1 flex flex-col">{children}</main>
    <Footer />
  </div>;
}
