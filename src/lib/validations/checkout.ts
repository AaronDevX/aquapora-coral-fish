import { z } from 'zod';

export const SHIPPING_METHODS = {
  pickup: {
    id: 'pickup',
    name: 'Recojo en tienda (José Marti 275, Lima)',
    costCents: 0,
    timeframe: 'Coordinar horario',
    description: 'Recojo directo en tienda física previa confirmación de preparación.',
  },
  standard_lima: {
    id: 'standard_lima',
    name: 'Envío estándar Lima Metropolitana',
    costCents: 1500,
    timeframe: '24 a 72 horas',
    description: 'Despacho seguro con aislamiento térmico para Lima Metropolitana.',
  },
  express_lima: {
    id: 'express_lima',
    name: 'Envío express motorizado Lima',
    costCents: 2500,
    timeframe: 'Mismo día / Inmediato',
    description: 'Envío urgente motorizado exclusivo con bolsa oxigenada y control de temperatura.',
  },
  provincia: {
    id: 'provincia',
    name: 'Envío a Provincia (Agencia Shalom / Marvisur)',
    costCents: 3500,
    timeframe: '24 a 48 horas',
    description: 'Empaque térmico de alta densidad con oxígeno medicinal y heat/cold pack.',
  },
} as const;

export type ShippingMethodKey = keyof typeof SHIPPING_METHODS;

export const checkoutItemSchema = z.object({
  productId: z.string().uuid({ message: 'ID de producto inválido' }),
  quantity: z.number().int().max(100_000).min(1, { message: 'La cantidad debe ser al menos 1' }),
});

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(3, { message: 'Ingrese su nombre completo (mínimo 3 caracteres)' })
    .max(100, { message: 'El nombre no debe exceder 100 caracteres' }),

  customerPhone: z
    .string()
    .trim()
    .regex(/^9\d{8}$/, {
      message: 'El teléfono debe ser un celular peruano válido de 9 dígitos que inicie con 9',
    }),

  customerAddress: z
    .string()
    .trim()
    .min(5, { message: 'Ingrese su dirección completa (calle, número o dpto)' })
    .max(300, { message: 'La dirección no debe exceder 300 caracteres' }),

  customerDistrict: z
    .string()
    .trim()
    .min(2, { message: 'Ingrese su distrito o ciudad de destino' })
    .max(100, { message: 'El distrito o ciudad no debe exceder 100 caracteres' }),

  customerReference: z
    .string()
    .trim()
    .max(300, { message: 'La referencia no debe exceder 300 caracteres' })
    .optional()
    .default(''),

  customerNotes: z
    .string()
    .trim()
    .max(500, { message: 'Las notas no deben exceder 500 caracteres' })
    .optional()
    .default(''),

  shippingMethod: z.enum(['pickup', 'standard_lima', 'express_lima', 'provincia'] as const),

  items: z
    .array(checkoutItemSchema)
    .max(100, { message: 'El carrito admite hasta 100 productos distintos' })
    .min(1, { message: 'El carrito no puede estar vacío' }),
}).superRefine((data, ctx) => {
  const productIds = new Set<string>();

  data.items.forEach((item, index) => {
    if (productIds.has(item.productId)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Un producto no puede aparecer más de una vez en el carrito',
        path: ['items', index, 'productId'],
      });
    }

    productIds.add(item.productId);
  });
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;
