import { STORE } from './store-config';

export interface WhatsAppOrderItem {
  productName: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
}

export interface WhatsAppOrderData {
  orderId: string;
  shortCode: string;
  items: WhatsAppOrderItem[];
  subtotalCents: number;
  shippingMethodName: string;
  shippingCents: number;
  totalCents: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerDistrict: string;
  customerReference?: string | null;
  customerNotes?: string | null;
}

const formatPEN = (cents: number): string => (cents / 100).toFixed(2);

/**
 * Generates the official formatted WhatsApp URL with pre-filled message
 * for AQUAPORA CORAL FISH customer service (+51 947 177 997).
 */
export function generateWhatsAppOrderUrl(data: WhatsAppOrderData): string {


  const itemsDetail = data.items
    .map(
      (item) =>
        `• *${item.productName}*\n  Cantidad: ${item.quantity} × S/ ${formatPEN(
          item.unitPriceCents
        )}\n  Subtotal: S/ ${formatPEN(item.subtotalCents)}`
    )
    .join('\n\n');

  const message = `*¡Hola, AQUAPORA CORAL FISH!*
Quisiera confirmar mi pedido *#${data.shortCode.replace(/^#/, '')}*.

*DETALLE DEL PEDIDO:*
${itemsDetail}

--------------------
*Subtotal productos:* S/ ${formatPEN(data.subtotalCents)}
*Entrega:* ${data.shippingMethodName} — S/ ${formatPEN(data.shippingCents)}
*TOTAL: S/ ${formatPEN(data.totalCents)}*
--------------------

*DATOS PARA LA ENTREGA:*
• *Nombre:* ${data.customerName}
• *Teléfono:* ${data.customerPhone}
• *Dirección:* ${data.customerAddress}
• *Distrito/Ciudad:* ${data.customerDistrict}
• *Referencia:* ${data.customerReference?.trim() || 'Ninguna'}
• *Notas:* ${data.customerNotes?.trim() || 'Sin notas adicionales'}

--------------------
*ID de Pedido:* ${data.orderId}
_Quedo a la espera de sus datos de cuenta (Yape / Plin / Transferencia BCP o Interbank) para realizar el pago. ¡Gracias!_`;

  return `${STORE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function generateWhatsAppOrderText(data: WhatsAppOrderData): string {
  const itemsDetail = data.items
    .map(
      (item) =>
        `• ${item.productName}\n  Cantidad: ${item.quantity} × S/ ${formatPEN(
          item.unitPriceCents
        )}\n  Subtotal: S/ ${formatPEN(item.subtotalCents)}`
    )
    .join('\n\n');

  return `¡Hola, AQUAPORA CORAL FISH!
Quisiera confirmar mi pedido #${data.shortCode.replace(/^#/, '')}.

DETALLE DEL PEDIDO:
${itemsDetail}

--------------------
Subtotal productos: S/ ${formatPEN(data.subtotalCents)}
Entrega: ${data.shippingMethodName} — S/ ${formatPEN(data.shippingCents)}
TOTAL: S/ ${formatPEN(data.totalCents)}
--------------------

DATOS PARA LA ENTREGA:
• Nombre: ${data.customerName}
• Teléfono: ${data.customerPhone}
• Dirección: ${data.customerAddress}
• Distrito/Ciudad: ${data.customerDistrict}
• Referencia: ${data.customerReference?.trim() || 'Ninguna'}
• Notas: ${data.customerNotes?.trim() || 'Sin notas adicionales'}

--------------------
ID de Pedido: ${data.orderId}`;
}
