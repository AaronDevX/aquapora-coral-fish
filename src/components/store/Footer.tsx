import Link from 'next/link';
import {
  Fish,
  Phone,
  MapPin,
  ShieldCheck,
  CreditCard,
  Truck,
  HeartHandshake,
  ExternalLink,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 mt-auto">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-900/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Garantía Arribo Vivo 100%</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Protección total en cada envío interprovincial o local. Ejemplares aclimatados con máxima salud.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-800/40 text-teal-400 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Empaque Térmico Especial</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Cajas de tecnopor de alta densidad, calor/frío pack y bolsas con oxígeno puro medicinal.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-800/40 text-blue-400 shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Asesoría de Biólogos</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Recomendaciones expertas de parámetros, química de agua, compatibilidad y alimentación.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Pagos Seguros y Flexibles</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Yape, Plin, BCP, Interbank, BBVA y todas las tarjetas de crédito o débito.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Fiscal Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-blue-600 p-0.5 shadow-md shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Fish className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-base font-black tracking-wider text-white uppercase">
                AQUAPORA CORAL FISH
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Especialistas en importación, cuarentena y cultivo sustentable de corales SPS, LPS,
              blandos y peces marinos de colección para el aficionado arrecifal peruano más exigente.
            </p>

            <div className="pt-2 text-xs space-y-1.5 border-t border-slate-900 text-slate-400">
              <p className="font-semibold text-slate-300">
                AQUAPORA WORLD TRADING S.A.C.
              </p>
              <p>RUC: <span className="font-mono text-cyan-400 font-medium">20611125543</span></p>
              <div className="flex items-center gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>José Marti 275, Lima, Perú</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Categorías Principales
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/catalogo?categoria=corales-sps" className="hover:text-cyan-400 transition-colors">
                  Corales SPS (Acroporas)
                </Link>
              </li>
              <li>
                <Link href="/catalogo?categoria=corales-lps" className="hover:text-cyan-400 transition-colors">
                  Corales LPS (Torches, Hammers)
                </Link>
              </li>
              <li>
                <Link href="/catalogo?categoria=corales-blandos" className="hover:text-cyan-400 transition-colors">
                  Corales Blandos y Zoanthus
                </Link>
              </li>
              <li>
                <Link href="/catalogo?categoria=peces-marinos" className="hover:text-cyan-400 transition-colors">
                  Peces Marinos Cuarentenados
                </Link>
              </li>
              <li>
                <Link href="/catalogo?categoria=anemonas-invertebrados" className="hover:text-cyan-400 transition-colors">
                  Anémonas y Equipo de Limpieza
                </Link>
              </li>
              <li>
                <Link href="/catalogo?categoria=alimentos-aditivos" className="hover:text-cyan-400 transition-colors">
                  Alimentos y Aditivos de Química
                </Link>
              </li>
            </ul>
          </div>

          {/* Guarantee & Care */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Garantía y Confianza
            </h5>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-400">
                <strong className="text-slate-300 block">Live Arrival Guarantee:</strong>
                Garantizamos la llegada con vida de cada organismo vivo. En caso de siniestro fortuito en tránsito, reponemos la pieza o emitimos crédito en tienda.
              </li>
              <li className="pt-1 text-slate-400">
                <strong className="text-slate-300 block">Protocolo de Aclimatación:</strong>
                Recomendamos goteo continuo mínimo de 45 a 60 minutos y aclimatación lumínica progresiva.
              </li>
            </ul>
          </div>

          {/* Contact & Payments */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Atención Personalizada
            </h5>
            <div className="space-y-3 text-xs">
              <a
                href="https://wa.me/51947177997"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/60 transition-colors w-full justify-center font-medium"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp: +51 947 177 997</span>
                <ExternalLink className="w-3 h-3 text-emerald-400/70 ml-auto" />
              </a>

              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Métodos de Pago Aceptados
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-300 font-medium">
                    Yape
                  </span>
                  <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-300 font-medium">
                    Plin
                  </span>
                  <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-300 font-medium">
                    BCP
                  </span>
                  <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-300 font-medium">
                    Interbank
                  </span>
                  <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-300 font-medium">
                    Visa / Mastercard
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} AQUAPORA WORLD TRADING S.A.C. Todos los derechos reservados.
          </p>
          <p className="text-[11px] text-slate-400">
            Acuariofilia Marina Sustentable · Lima, Perú
          </p>
        </div>
      </div>
    </footer>
  );
}
