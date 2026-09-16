import { MapPin, MessageCircle, Building2 } from 'lucide-react';
import { STORE } from '@/lib/store-config';
export const metadata = { title: 'Contacto | AQUAPORA CORAL FISH', description: 'Asesoría para tu acuario marino, cotizaciones especiales y envíos a todo el Perú.' };

export default function ContactPage() {
  const message = encodeURIComponent('¡Hola, Aquapora! Quisiera asesoría y una cotización para mi acuario marino.');
  return <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
    <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">Estamos para ayudarte</p>
    <h1 className="mt-3 text-4xl font-bold">Conversemos sobre tu arrecife</h1>
    <p className="mt-4 max-w-2xl leading-relaxed text-slate-400">Cotizaciones especiales, envíos a provincia y pedidos mayoristas. Recibe atención personalizada para elegir lo mejor para tu acuario.</p>
    <div className="mt-10 grid gap-6 md:grid-cols-2">
      <article className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-7">
        <Building2 className="text-cyan-400" /><h2 className="text-lg font-bold">{STORE.legalName}</h2>
        <p className="text-slate-300">RUC {STORE.ruc}</p><p className="flex items-start gap-2 text-slate-300"><MapPin className="shrink-0 text-cyan-400" />{STORE.address}</p>
      </article>
      <article className="rounded-2xl border border-cyan-900 bg-cyan-950/30 p-7">
        <MessageCircle className="text-emerald-400" /><h2 className="mt-5 text-lg font-bold">Atención por WhatsApp</h2>
        <p className="mb-6 mt-3 text-slate-300">{STORE.phone}</p>
        <a href={`${STORE.whatsapp}?text=${message}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-300"><MessageCircle size={20} />Iniciar conversación</a>
      </article>
    </div>
    <div id="faq" className="mt-10 space-y-4"><h2 className="text-xl font-bold">Preguntas frecuentes</h2>
      <details className="rounded-xl border border-slate-800 p-5"><summary className="cursor-pointer font-semibold">¿Realizan envíos a provincia?</summary><p className="mt-3 text-slate-400">Sí. Escríbenos con tu ciudad y los productos que buscas para coordinar disponibilidad, transporte y entrega.</p></details>
      <details className="rounded-xl border border-slate-800 p-5"><summary className="cursor-pointer font-semibold">¿Puedo solicitar una cotización mayorista?</summary><p className="mt-3 text-slate-400">Sí. Comparte tu lista y cantidades por WhatsApp para recibir una cotización personalizada.</p></details>
    </div>
  </section>;
}
