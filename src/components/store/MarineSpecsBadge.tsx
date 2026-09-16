import { Sun, Waves, Gauge, Compass } from 'lucide-react';
import type { ProductSpecs } from '@/db/schema';

interface MarineSpecsBadgeProps {
  specs?: Partial<ProductSpecs> | null;
  size?: 'sm' | 'md';
  variant?: 'grid' | 'inline';
}

export function MarineSpecsBadge({
  specs,
  size = 'md',
  variant = 'grid',
}: MarineSpecsBadgeProps) {
  if (!specs) return null;

  const difficultyColors = {
    Principiante: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50',
    Intermedio: 'text-amber-400 bg-amber-950/60 border-amber-700/50',
    Avanzado: 'text-rose-400 bg-rose-950/60 border-rose-700/50',
    Experto: 'text-purple-400 bg-purple-950/60 border-purple-700/50',
  };

  const diffColor =
    specs.difficulty && difficultyColors[specs.difficulty]
      ? difficultyColors[specs.difficulty]
      : 'text-cyan-400 bg-cyan-950/60 border-cyan-800/50';

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-2 text-xs">
        {specs.difficulty && (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium ${diffColor}`}
          >
            <Gauge className="w-3.5 h-3.5" />
            {specs.difficulty}
          </span>
        )}
        {specs.lighting && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900/80 text-amber-300 font-medium">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            Luz: {specs.lighting}
          </span>
        )}
        {specs.flow && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900/80 text-cyan-300 font-medium">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            Flujo: {specs.flow}
          </span>
        )}
        {specs.placement && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900/80 text-blue-300 font-medium">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            {specs.placement}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 ${
        size === 'sm' ? 'gap-2 text-[11px]' : 'gap-3 text-xs'
      }`}
    >
      {/* Dificultad */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
        <div className={`p-1.5 rounded-md border ${diffColor} shrink-0`}>
          <Gauge className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Dificultad
          </span>
          <span className="font-semibold text-slate-200 truncate block">
            {specs.difficulty || 'No especificada'}
          </span>
        </div>
      </div>

      {/* Luz PAR */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
        <div className="p-1.5 rounded-md border border-amber-800/40 bg-amber-950/40 text-amber-400 shrink-0">
          <Sun className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Luz / PAR
          </span>
          <span className="font-semibold text-slate-200 truncate block">
            {specs.lighting || 'Media'}
          </span>
        </div>
      </div>

      {/* Flujo de Agua */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
        <div className="p-1.5 rounded-md border border-cyan-800/40 bg-cyan-950/40 text-cyan-400 shrink-0">
          <Waves className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Flujo Marino
          </span>
          <span className="font-semibold text-slate-200 truncate block">
            {specs.flow || 'Moderado'}
          </span>
        </div>
      </div>

      {/* Posición */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
        <div className="p-1.5 rounded-md border border-blue-800/40 bg-blue-950/40 text-blue-400 shrink-0">
          <Compass className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Posición Arrecife
          </span>
          <span className="font-semibold text-slate-200 truncate block">
            {specs.placement || 'Tercio Medio'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function DifficultyBadge({
  difficulty,
}: {
  difficulty?: ProductSpecs['difficulty'];
}) {
  const colors: Record<string, string> = {
    Principiante: 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60',
    Intermedio: 'bg-amber-950/80 text-amber-400 border-amber-700/60',
    Avanzado: 'bg-rose-950/80 text-rose-400 border-rose-700/60',
    Experto: 'bg-purple-950/80 text-purple-400 border-purple-700/60',
  };

  const style = difficulty && colors[difficulty] ? colors[difficulty] : colors.Intermedio;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {difficulty || 'Intermedio'}
    </span>
  );
}
