'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, LoaderCircle, LockKeyhole } from 'lucide-react';
import { loginAction } from '@/actions/adminActions';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData) {
    const password = String(formData.get('password') ?? '');
    const totpCode = String(formData.get('totpCode') ?? '').replace(/\D/g, '');
    setError(null);

    startTransition(async () => {
      const result = await loginAction(password, totpCode);
      if (!result.success) {
        setError(result.error ?? 'No se pudo validar tu acceso.');
        return;
      }
      const next = searchParams.get('next');
      const destination = next?.startsWith('/admin/') ? next : '/admin/dashboard';
      router.replace(destination);
      router.refresh();
    });
  }

  return (
    <form action={submit} className="space-y-5" noValidate>
      <label className="block space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Contraseña de administrador</span>
        <span className="relative block">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={pending}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-60"
            placeholder="Tu contraseña segura"
          />
        </span>
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Código de Google Authenticator</span>
        <span className="relative block">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            name="totpCode"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            disabled={pending}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-3 font-mono text-base tracking-[0.35em] text-white outline-none transition placeholder:tracking-normal focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-60"
            placeholder="000000"
          />
        </span>
      </label>

      {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-200">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-4 py-3.5 text-sm font-black text-slate-950 transition hover:from-cyan-300 hover:to-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
        {pending ? 'Verificando acceso…' : 'Acceder al panel seguro'}
      </button>
    </form>
  );
}
