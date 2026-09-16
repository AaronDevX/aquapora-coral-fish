'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { createOrderAction } from '@/actions/orderActions';
import { useHydrated } from '@/lib/useHydrated';
import {
  SHIPPING_METHODS,
  type ShippingMethodKey,
} from '@/lib/validations/checkout';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageCircle,
  Loader2,
  AlertCircle,
  MapPin,
  Phone,
  User,
  FileText,
} from 'lucide-react';

export default function CartCheckoutPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, getSubtotalCents } =
    useCartStore();

  const mounted = useHydrated();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerDistrict: '',
    customerReference: '',
    customerNotes: '',
    shippingMethod: 'standard_lima' as ShippingMethodKey,
  });

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const subtotalCents = getSubtotalCents();
  const selectedShipping = SHIPPING_METHODS[formData.shippingMethod];
  const shippingCents = selectedShipping.costCents;
  const totalCents = subtotalCents + shippingCents;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic frontend checks
    if (!formData.customerName.trim() || formData.customerName.trim().length < 3) {
      setErrorMessage('Por favor ingrese su nombre completo (mínimo 3 caracteres).');
      return;
    }

    if (!/^9\d{8}$/.test(formData.customerPhone.trim())) {
      setErrorMessage(
        'El celular debe ser un número peruano de 9 dígitos que comience con 9.'
      );
      return;
    }

    if (!formData.customerAddress.trim() || formData.customerAddress.trim().length < 5) {
      setErrorMessage('Por favor ingrese una dirección de entrega válida.');
      return;
    }

    if (!formData.customerDistrict.trim() || formData.customerDistrict.trim().length < 2) {
      setErrorMessage('Por favor ingrese su distrito o ciudad de destino.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Su carrito de compras está vacío.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerAddress: formData.customerAddress.trim(),
        customerDistrict: formData.customerDistrict.trim(),
        customerReference: formData.customerReference.trim(),
        customerNotes: formData.customerNotes.trim(),
        shippingMethod: formData.shippingMethod,
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
      };

      const result = await createOrderAction(payload);

      if (!result.success || !result.orderId) {
        setErrorMessage(result.error || 'Ocurrió un error al procesar el pedido.');
        setIsSubmitting(false);
        return;
      }

      // Success! Clear cart
      clearCart();

      // Open WhatsApp in new tab if available
      if (result.whatsappUrl) {
        window.open(result.whatsappUrl, '_blank');
      }

      // Navigate to order confirmation page
      router.push(`/pedido/${result.orderId}`);
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      setErrorMessage('Error de conexión al servidor. Inténtelo nuevamente.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-slate-800/80 flex items-center justify-center text-cyan-400/50">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              Tu Carrito de Arrecife está Vacío
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Aún no has seleccionado corales SPS, LPS o peces marinos de nuestra colección.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="px-8 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explorar Catálogo Especializado</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title */}
      <div className="mb-8 pb-4 border-b border-slate-800">
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block mb-1">
          Finalizar Compra
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Carrito y Despacho de Arrecife
        </h1>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-8 p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-sm flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* 2-Column Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <span>Ejemplares Seleccionados ({items.length})</span>
            </h2>
            <Link
              href="/catalogo"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              + Agregar más
            </Link>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/producto/${item.slug}`}
                        className="text-sm sm:text-base font-bold text-slate-100 hover:text-cyan-300 transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Eliminar del carrito"
                        aria-label={`Eliminar ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.isWysiwyg && (
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950/70 px-2 py-0.5 rounded border border-purple-800/40">
                        WYSIWYG · Pieza Única
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60">
                    {item.isWysiwyg ? (
                      <span className="text-xs text-slate-400 font-medium">
                        Cant: 1 (Pieza Única)
                      </span>
                    ) : (
                      <div className="flex items-center border border-slate-700 rounded-lg bg-slate-950">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-slate-400 hover:text-white transition-colors"
                          aria-label="Disminuir"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                          aria-label="Aumentar"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Subtotal</span>
                      <span className="text-base font-black text-cyan-300">
                        S/ {((item.priceCents * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Guarantees Box */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center gap-4 text-xs text-slate-400">
            <ShieldCheck className="w-6 h-6 text-teal-400 shrink-0" />
            <div>
              <strong className="text-slate-300 block">Garantía de Llegada Viva Incluida</strong>
              Empaque con control térmico, oxígeno medicinal y aclimatación garantizada.
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Form & Summary */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6"
          >
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                <span>Datos de Despacho (Perú)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Completa los datos para coordinar el despacho seguro de tus ejemplares.
              </p>
            </div>

            {/* Customer Inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Nombre y Apellidos *</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Ej: Carlos Mendoza"
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Celular / WhatsApp (9 dígitos) *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-cyan-400 select-none">
                    +51
                  </span>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    placeholder="947177997"
                    maxLength={9}
                    inputMode="numeric"
                    pattern="9[0-9]{8}"
                    required
                    className="w-full pl-12 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono tracking-wider transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Distrito / Ciudad *</span>
                  </label>
                  <input
                    type="text"
                    name="customerDistrict"
                    value={formData.customerDistrict}
                    onChange={handleInputChange}
                    placeholder="Ej: Miraflores / Arequipa"
                    required
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Dirección Exacta *</span>
                  </label>
                  <input
                    type="text"
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleInputChange}
                    placeholder="Calle, Av, Nro, Dpto"
                    required
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Referencia de Entrega (Opcional)
                </label>
                <input
                  type="text"
                  name="customerReference"
                  value={formData.customerReference}
                  onChange={handleInputChange}
                  placeholder="Ej: Frente al parque, puerta azul"
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Notas Adicionales (Opcional)</span>
                </label>
                <textarea
                  name="customerNotes"
                  value={formData.customerNotes}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Instrucciones de empaque, horario preferido o coordinación de agencia..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none transition-all"
                />
              </div>
            </div>

            {/* Shipping Methods Selector */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Método de Entrega
              </label>

              <div className="space-y-2">
                {(Object.keys(SHIPPING_METHODS) as ShippingMethodKey[]).map((key) => {
                  const method = SHIPPING_METHODS[key];
                  const isSelected = formData.shippingMethod === key;

                  return (
                    <label
                      key={key}
                      className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-950/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={key}
                            checked={isSelected}
                            onChange={() =>
                              setFormData((prev) => ({ ...prev, shippingMethod: key }))
                            }
                            className="text-cyan-500 focus:ring-cyan-500 h-4 w-4 bg-slate-900 border-slate-700"
                          />
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-slate-200 block">
                              {method.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {method.description} · ({method.timeframe})
                            </span>
                          </div>
                        </div>

                        <span className="text-xs sm:text-sm font-black text-cyan-300 shrink-0">
                          {method.costCents === 0
                            ? 'Gratis'
                            : `S/ ${(method.costCents / 100).toFixed(2)}`}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal productos:</span>
                <span className="font-semibold text-slate-200">
                  S/ {(subtotalCents / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Flete de entrega:</span>
                <span className="font-semibold text-slate-200">
                  {shippingCents === 0 ? 'Gratis' : `S/ ${(shippingCents / 100).toFixed(2)}`}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">TOTAL FINAL:</span>
                <span className="text-2xl font-black text-cyan-300">
                  S/ {(totalCents / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/25 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Procesando Pedido...</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  <span>Completar Pedido y Abrir WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Al hacer clic, se generará tu orden oficial y se abrirá WhatsApp para coordinar el pago
              vía Yape, Plin o Transferencia bancaria directa.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
