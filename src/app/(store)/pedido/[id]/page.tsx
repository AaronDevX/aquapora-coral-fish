import { cookies } from 'next/headers';
import { getAdminSession } from '@/lib/auth';
import { receiptCookieName, verifyReceiptToken, isReceiptCurrent } from '@/lib/receipt';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/db';
import {
  SHIPPING_METHODS,
  type ShippingMethodKey,
} from '@/lib/validations/checkout';
import {
  generateWhatsAppOrderUrl,
  generateWhatsAppOrderText,
} from '@/lib/whatsapp';
import { OrderReceiptActions } from '@/components/store/OrderReceiptActions';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  Truck,
  ShieldCheck,
  CreditCard,
  Building2,
  QrCode,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Comprobante privado | AQUAPORA', robots: { index: false, follow: false } };

export default async function OrderConfirmationPage({ params }: OrderPageProps) {
  const { id } = await params;
  if (!/^AQ-[0-9]{8}-[A-Z0-9]{4,12}$/.test(id)) notFound();
  const token = (await cookies()).get(receiptCookieName(id))?.value;
  const admin = await getAdminSession();
  if (!token && !admin) notFound();

  // 1. Fetch order with relational orderItems and products
  const order = await db.query.orders.findFirst({
    where: (o, { eq }) => eq(o.id, id),
    with: {
      items: {
        with: {
          product: true,
        },
      },
    },
  });

  if (!order || (!admin && (!verifyReceiptToken(token, order.receiptTokenHash) || !isReceiptCurrent(order.createdAt)))) {
    notFound();
  }

  const shippingMeta =
    SHIPPING_METHODS[order.shippingMethod as ShippingMethodKey] || {
      id: order.shippingMethod,
      name: order.shippingMethod,
      costCents: order.shippingCents,
      timeframe: 'Coordinar despacho',
      description: 'Entrega especializada',
    };

  const formattedItems = order.items.map((i) => ({
    productName: i.productName,
    quantity: i.quantity,
    unitPriceCents: i.unitPriceCents,
    subtotalCents: i.subtotalCents,
  }));

  const orderData = {
    orderId: order.id,
    shortCode: order.shortCode,
    items: formattedItems,
    subtotalCents: order.subtotalCents,
    shippingMethodName: shippingMeta.name,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    customerDistrict: order.customerDistrict,
    customerReference: order.customerReference,
    customerNotes: order.customerNotes,
  };

  const whatsappUrl = generateWhatsAppOrderUrl(orderData);
  const orderSummaryText = generateWhatsAppOrderText(orderData);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header Badge & Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-xs font-bold shadow-lg shadow-emerald-950/40 animate-in fade-in zoom-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>¡Pedido Registrado con Éxito en Sistema!</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Recibo Digital de Arrecife
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Tu orden ha sido reservada en nuestra base de datos. Completa la coordinación de pago vía WhatsApp para programar el empaque térmico de tus piezas.
        </p>
      </div>

      {/* Main Digital Receipt Card */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden divide-y divide-slate-800/80">
        {/* Receipt Header Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block">
              Identificador de Orden
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl font-black font-mono text-cyan-300">
                {order.id}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-700/60 font-mono font-bold text-xs text-cyan-300">
                {order.shortCode}
              </span>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/70 border border-amber-700/60 text-amber-300 text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Pendiente de Pago</span>
            </div>
            <span className="block text-[11px] text-slate-400 mt-1">
              {new Date(order.createdAt).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* WhatsApp & Copy Actions */}
        <div className="p-6 sm:p-8 bg-slate-950/40">
          <OrderReceiptActions
            whatsappUrl={whatsappUrl}
            orderSummaryText={orderSummaryText}
          />
        </div>

        {/* Order Items Breakdown */}
        <div className="p-6 sm:p-8 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Detalle de Ejemplares Solicitados
          </h2>

          <div className="divide-y divide-slate-800/60">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  {item.product?.imageUrl ? (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.productName}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-100 truncate">
                      {item.productName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.quantity} × S/ {(item.unitPriceCents / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-cyan-300">
                    S/ {(item.subtotalCents / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Breakdown */}
          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal productos:</span>
              <span className="font-semibold text-slate-200">
                S/ {(order.subtotalCents / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Entrega ({shippingMeta.name}):</span>
              <span className="font-semibold text-slate-200">
                {order.shippingCents === 0
                  ? 'Gratis'
                  : `S/ ${(order.shippingCents / 100).toFixed(2)}`}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                TOTAL A PAGAR:
              </span>
              <span className="text-2xl font-black text-cyan-300 font-mono">
                S/ {(order.totalCents / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="p-6 sm:p-8 space-y-4 bg-slate-950/20">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-cyan-400" />
            <span>Datos de Entrega y Destinatario</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 block">Destinatario:</span>
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {order.customerName}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block">Celular / WhatsApp:</span>
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                +51 {order.customerPhone}
              </span>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <span className="text-slate-500 block">Dirección y Destino:</span>
              <span className="font-medium text-slate-200 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  {order.customerAddress} — {order.customerDistrict}
                  {order.customerReference && (
                    <span className="text-slate-400 block mt-0.5">
                      Ref: {order.customerReference}
                    </span>
                  )}
                </span>
              </span>
            </div>

            {order.customerNotes && (
              <div className="space-y-1 sm:col-span-2">
                <span className="text-slate-500 block">Notas adicionales:</span>
                <p className="text-slate-300 italic">{order.customerNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Instructions Box */}
        <div className="p-6 sm:p-8 space-y-6 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                Instrucciones de Pago
              </h2>
              <p className="text-xs text-slate-400">
                Aceptamos transferencias inmediatas, Yape, Plin y depósitos bancarios.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Yape & Plin */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <QrCode className="w-4 h-4" />
                <span>Yape / Plin</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-mono text-base font-bold text-white tracking-wider">
                  947 177 997
                </p>
                <p className="text-slate-400 text-[11px]">
                  Titular: <strong className="text-slate-300">AQUAPORA WORLD TRADING S.A.C.</strong>
                </p>
              </div>
            </div>

            {/* BCP */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>BCP Banco de Crédito (Soles)</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-slate-300">
                  Cta Cte:{' '}
                  <span className="font-mono text-cyan-300 font-bold select-all">
                    193-9823412-0-45
                  </span>
                </p>
                <p className="text-slate-400 text-[11px]">
                  CCI:{' '}
                  <span className="font-mono text-slate-300 select-all">
                    00219300982341204518
                  </span>
                </p>
              </div>
            </div>

            {/* Interbank */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>Interbank (Soles)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <p className="text-slate-300">
                  Cta Cte:{' '}
                  <span className="font-mono text-teal-300 font-bold select-all">
                    200-3001847123
                  </span>
                </p>
                <p className="text-slate-400 text-[11px]">
                  CCI:{' '}
                  <span className="font-mono text-slate-300 select-all">
                    00320000300184712349
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-800/40 text-xs text-teal-200 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold text-teal-100">
                Protocolo de Acondicionamiento y Despacho Térmico
              </strong>
              Una vez enviado el comprobante por WhatsApp, tu pedido entrará en preparación y acondicionamiento térmico (oxígeno puro medicinal y contenedor de tecnopor sellado).
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Return Button */}
      <div className="text-center pt-4">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo de Corales y Peces</span>
        </Link>
      </div>
    </div>
  );
}
