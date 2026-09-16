'use client';

import { useState } from 'react';
import { MessageCircle, Copy, Check, ExternalLink } from 'lucide-react';

interface OrderReceiptActionsProps {
  whatsappUrl: string;
  orderSummaryText: string;
}

export function OrderReceiptActions({
  whatsappUrl,
  orderSummaryText,
}: OrderReceiptActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderSummaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy summary:', err);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Primary Giant WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 animate-pulse"
      >
        <MessageCircle className="w-5 h-5 fill-slate-950" />
        <span>Continuar a WhatsApp para Enviar Pedido</span>
        <ExternalLink className="w-4 h-4 opacity-70" />
      </a>

      {/* Secondary Copy Summary Button */}
      <button
        onClick={handleCopy}
        className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300">¡Resumen copiado al portapapeles!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 text-slate-400" />
            <span>Copiar Resumen del Pedido</span>
          </>
        )}
      </button>
    </div>
  );
}
