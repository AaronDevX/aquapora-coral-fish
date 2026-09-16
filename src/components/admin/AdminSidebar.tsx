'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  BarChart3,
  ClipboardList,
  ExternalLink,
  Fish,
  History,
  LogOut,
  PackageSearch,
  ShieldCheck,
} from 'lucide-react';
import { logoutAction } from '@/actions/adminActions';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/productos', label: 'Productos e inventario', icon: PackageSearch },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList },
  { href: '/admin/auditoria', label: 'Auditoría', icon: History },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function logout() {
    setError(null);
    startTransition(async () => {
      const result = await logoutAction();
      if (result.success) {
        router.replace('/admin/login');
        router.refresh();
      } else {
        setError(result.error ?? 'No se pudo cerrar la sesión.');
      }
    });
  }

  return (
    <aside className="w-full border-b border-slate-800 bg-slate-950/95 p-4 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:p-5">
      <div className="flex items-center gap-3 px-2 pb-4 lg:pb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 glow-cyan">
          <Fish className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-black tracking-wide text-white">AQUAPORA</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">Admin Console</p>
        </div>
      </div>

      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1" aria-label="Navegación administrativa">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${
                active
                  ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
              href={href}
              key={href}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-slate-800 pt-4 lg:mt-8">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-100"
        >
          <ExternalLink className="h-4 w-4" />
          Ir a la tienda pública
        </Link>
        <button
          type="button"
          onClick={logout}
          disabled={pending}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-rose-300 transition-colors hover:bg-rose-500/10 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>
        {error && <p className="mt-2 px-3 text-xs text-rose-300">{error}</p>}
      </div>

      <div className="mt-6 hidden rounded-xl border border-slate-800 bg-slate-900/70 p-3 lg:block">
        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
          Sesión protegida con 2FA
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-500">Acciones y ajustes registrados en el historial de auditoría.</p>
      </div>
    </aside>
  );
}
