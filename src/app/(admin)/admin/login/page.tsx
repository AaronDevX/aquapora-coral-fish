import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { Fish, ShieldCheck } from 'lucide-react';
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata = { title: 'Acceso administrativo | AQUAPORA' };

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect('/admin/dashboard');
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(8,145,178,0.18),transparent_70%)]" />
      <section className="relative w-full max-w-md rounded-3xl border border-slate-700/80 bg-slate-900/90 p-6 shadow-2xl shadow-cyan-950/50 backdrop-blur sm:p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 glow-cyan">
            <Fish className="h-7 w-7" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Aquapora Coral Fish</p>
          <h1 className="mt-2 text-2xl font-black text-white">Panel administrativo</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">Acceso protegido con contraseña y autenticación de dos factores.</p>
        </div>
        <LoginForm />
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Sesión firmada, HttpOnly y limitada a 7 días
        </div>
      </section>
    </main>
  );
}
