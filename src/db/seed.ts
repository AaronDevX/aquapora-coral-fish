import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from './index';
import { categories, products, type NewCategory, type NewProduct } from './schema';

const initialCategories: NewCategory[] = [
  {
    id: 'corales-sps',
    name: 'Corales SPS',
    slug: 'corales-sps',
    description:
      'Corales duros de pólipo corto (Acroporas, Montiporas, Pocilloporas). Requieren estabilidad absoluta y luz intensa.',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'corales-lps',
    name: 'Corales LPS',
    slug: 'corales-lps',
    description:
      'Corales duros de pólipo largo (Euphyllias, Torches, Hammers, Acantofilias, Scolymias). Movimiento hipnótico y colores vibrantes.',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'corales-blandos',
    name: 'Corales Blandos y Zoanthus',
    slug: 'corales-blandos',
    description:
      'Zoanthus Ultra, Discosomas, Ricordeas y corales de cuero. Resistentes y de fácil aclimatación.',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'peces-marinos',
    name: 'Peces Marinos',
    slug: 'peces-marinos',
    description:
      'Peces de arrecife cuarentenados y aclimatados: Ocellaris, Cirujanos, Damiselas, Lábridos.',
    displayOrder: 4,
    isActive: true,
  },
  {
    id: 'anemonas-invertebrados',
    name: 'Anémonas e Invertebrados',
    slug: 'anemonas-invertebrados',
    description:
      'Anémonas BTA, gambas limpiadoras, caracoles turbo y equipo de limpieza para control biológico.',
    displayOrder: 5,
    isActive: true,
  },
  {
    id: 'alimentos-aditivos',
    name: 'Alimentos y Aditivos',
    slug: 'alimentos-aditivos',
    description:
      'Suplementación química, fito y zooplancton, alimentos especializados para corales y peces marinos.',
    displayOrder: 6,
    isActive: true,
  },
];

const initialProducts: NewProduct[] = [
  {
    slug: 'acropora-millepora-sunset-rainbow',
    name: 'Acropora Millepora "Sunset Rainbow"',
    scientificName: 'Acropora millepora',
    categoryId: 'corales-sps',
    type: 'SPS Frag',
    priceCents: 28000,
    stock: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=800&q=80',
    ],
    isFeatured: true,
    isSale: false,
    isActive: true,
    isWysiwyg: true,
    description:
      'Ejemplar único WYSIWYG de Acropora Millepora con pólipos densos color naranja y verde fluorescente bajo luz actínica. Esqueleto bien consolidado sobre plug cerámico.',
    careInstructions:
      'Aclimatación por goteo durante 45 min. Posicionar en el tercio superior del arrecife con flujo turbulento vigoroso y PAR entre 250 y 350.',
    specs: {
      difficulty: 'Avanzado',
      lighting: 'Muy Alta (PAR 250+)',
      flow: 'Fuerte / Turbulento',
      placement: 'Tercio Superior',
      temperatura: '24°C - 26°C',
      salinidad: '1.025 - 1.026 SG',
      kh: '8.0 - 8.5 dKH',
      calcio: '420 - 440 ppm',
      magnesio: '1350 - 1400 ppm',
    },
  },
  {
    slug: 'acropora-tenuis-electric-neon',
    name: 'Acropora Tenuis "Electric Neon"',
    scientificName: 'Acropora tenuis',
    categoryId: 'corales-sps',
    type: 'SPS Frag',
    priceCents: 32000,
    stock: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    isFeatured: true,
    isSale: false,
    isActive: true,
    isWysiwyg: false,
    description:
      'Frags cultivados de Acropora Tenuis con coloración azul eléctrica y puntas celestes brillantes. Crecimiento tipo arbusto con alta calcificación.',
    careInstructions:
      'Requiere sistema maduro con niveles indetectables de fosfatos (menores a 0.03 ppm) y nitratos estables entre 5-10 ppm.',
    specs: {
      difficulty: 'Experto',
      lighting: 'Muy Alta (PAR 250+)',
      flow: 'Fuerte / Turbulento',
      placement: 'Tercio Superior',
      temperatura: '25°C',
      salinidad: '1.025 SG',
      kh: '8.2 dKH',
      calcio: '430 ppm',
      magnesio: '1380 ppm',
    },
  },
  {
    slug: 'euphyllia-torch-dragon-soul',
    name: 'Euphyllia Torch "Dragon Soul"',
    scientificName: 'Euphyllia glabrescens',
    categoryId: 'corales-lps',
    type: 'LPS Colony',
    priceCents: 45000,
    stock: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    isFeatured: true,
    isSale: false,
    isActive: true,
    isWysiwyg: true,
    description:
      'Cabeza de Torch Dragon Soul auténtica grado Ultra. Tentáculos dorados metálicos con puntas verdes fluorescentes y centro violeta profundo.',
    careInstructions:
      'Evitar flujo directo que rasgue el tejido. Proporcionar flujo alterno moderado para permitir que los tentáculos dancen libremente.',
    specs: {
      difficulty: 'Intermedio',
      lighting: 'Media',
      flow: 'Moderado',
      placement: 'Tercio Medio',
      temperatura: '24°C - 26°C',
      salinidad: '1.025 SG',
      kh: '8.0 - 9.0 dKH',
      calcio: '420 ppm',
      magnesio: '1350 ppm',
    },
  },
  {
    slug: 'euphyllia-hammer-toxic-green',
    name: 'Euphyllia Hammer "Toxic Green"',
    scientificName: 'Euphyllia ancora',
    categoryId: 'corales-lps',
    type: 'LPS Frag',
    priceCents: 18000,
    stock: 5,
    imageUrl:
      'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    isFeatured: false,
    isSale: true,
    isActive: true,
    isWysiwyg: false,
    description:
      'Frag de dos cabezas de coral martillo verde radiactivo. Excelente extensión diurna y crecimiento vigoroso bajo espectro azul actinio.',
    careInstructions:
      'Alimentación semanal con mysis o pellets de LPS para potenciar coloración y reproducción de cabezas.',
    specs: {
      difficulty: 'Principiante',
      lighting: 'Media',
      flow: 'Moderado',
      placement: 'Tercio Medio',
      temperatura: '24.5°C - 25.5°C',
      salinidad: '1.024 - 1.026 SG',
      kh: '8.0 - 8.5 dKH',
    },
  },
  {
    slug: 'zoanthus-utter-chaos-rock',
    name: 'Roca de Zoanthus "Utter Chaos" Ultra',
    scientificName: 'Zoanthus gigantus',
    categoryId: 'corales-blandos',
    type: 'Soft Coral Colony',
    priceCents: 15000,
    stock: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    isFeatured: true,
    isSale: false,
    isActive: true,
    isWysiwyg: false,
    description:
      'Colonia de más de 8 pólipos de Utter Chaos con patrón caótico rojo, naranja fuego y centro moteado blanco-azul. Muy resistentes y de rápida propagación.',
    careInstructions:
      'Manipular siempre con guantes y gafas protectoras debido a la posible presencia de palitoxina natural.',
    specs: {
      difficulty: 'Principiante',
      lighting: 'Baja',
      flow: 'Suave',
      placement: 'Fondo / Arena',
      temperatura: '24°C - 26°C',
      salinidad: '1.024 - 1.026 SG',
    },
  },
  {
    slug: 'pez-payaso-ocellaris-black-storm',
    name: 'Pez Payaso Ocellaris "Black Storm"',
    scientificName: 'Amphiprion ocellaris var.',
    categoryId: 'peces-marinos',
    type: 'Pez Arrecife',
    priceCents: 24000,
    stock: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    isFeatured: true,
    isSale: false,
    isActive: true,
    isWysiwyg: false,
    description:
      'Pez payaso de criadero seleccionado por su patrón blanco y negro tipo Storm de alto contraste. Totalmente aclimatado a alimento seco en hojuelas y pellets.',
    careInstructions:
      'Apto para acuarios a partir de 80 litros. Convive en armonía con anémonas de la especie Entacmaea quadricolor.',
    specs: {
      difficulty: 'Principiante',
      lighting: 'Media',
      flow: 'Moderado',
      placement: 'Tercio Medio',
      temperatura: '25°C',
      salinidad: '1.025 SG',
    },
  },
  {
    slug: 'cirujano-amarillo-hawaiano-yellow-tang',
    name: 'Cirujano Amarillo Hawaiano (Yellow Tang)',
    scientificName: 'Zebrasoma flavescens',
    categoryId: 'peces-marinos',
    type: 'Pez Arrecife',
    priceCents: 68000,
    stock: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    isFeatured: true,
    isSale: false,
    isActive: true,
    isWysiwyg: true,
    description:
      'Ejemplar juvenil de 7 cm nacido en cautiverio con certificación de sostenibilidad. Excelente controlador de algas filamentosas en tanques de arrecife.',
    careInstructions:
      'Acuario mínimo recomendado de 300 litros con abundante roca viva y espacio libre para natación activa. Dieta rica en alga nori.',
    specs: {
      difficulty: 'Intermedio',
      lighting: 'Media',
      flow: 'Fuerte / Turbulento',
      placement: 'Tercio Medio',
      temperatura: '24°C - 26°C',
      salinidad: '1.025 SG',
    },
  },
  {
    slug: 'anemona-burbuja-rose-bta-ultra',
    name: 'Anémona Burbuja Rose BTA Ultra',
    scientificName: 'Entacmaea quadricolor',
    categoryId: 'anemonas-invertebrados',
    type: 'Anémona Marina',
    priceCents: 26000,
    stock: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    isFeatured: true,
    isSale: false,
    isActive: true,
    isWysiwyg: false,
    description:
      'Anémona BTA con bulbos de color rosa fucsia intenso y puntas verdes. Ideal para hospedaje natural de peces payaso Amphiprion.',
    careInstructions:
      'Proteger las bombas de circulación con esponjas. Dejar que la anémona fije su pie en una hendidura de roca con buena iluminación.',
    specs: {
      difficulty: 'Intermedio',
      lighting: 'Alta',
      flow: 'Moderado',
      placement: 'Tercio Medio',
      temperatura: '25°C',
      salinidad: '1.025 - 1.026 SG',
      kh: '8.0 - 8.5 dKH',
    },
  },
  {
    slug: 'gamba-limpiadora-escarlata',
    name: 'Gamba Limpiadora Escarlata',
    scientificName: 'Lysmata amboinensis',
    categoryId: 'anemonas-invertebrados',
    type: 'Invertebrado Arrecifal',
    priceCents: 8500,
    stock: 8,
    imageUrl:
      'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    isFeatured: false,
    isSale: false,
    isActive: true,
    isWysiwyg: false,
    description:
      'Invertebrado esencial para acuarios de arrecife. Limpia parásitos de los peces y consume restos de comida entre las rocas.',
    careInstructions:
      'Aclimatación muy lenta por goteo (mínimo 1 hora). Sensible a cambios bruscos de densidad salina y presencia de cobre.',
    specs: {
      difficulty: 'Principiante',
      lighting: 'Media',
      flow: 'Suave',
      placement: 'Fondo / Arena',
      temperatura: '24°C - 26°C',
      salinidad: '1.025 SG',
    },
  },
  {
    slug: 'seachem-reef-plus-500ml',
    name: 'Seachem Reef Plus 500ml',
    scientificName: 'Suplemento Arrecife',
    categoryId: 'alimentos-aditivos',
    type: 'Aditivo Marino',
    priceCents: 7500,
    stock: 15,
    imageUrl:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    isFeatured: false,
    isSale: false,
    isActive: true,
    isWysiwyg: false,
    description:
      'Suplemento completo de elementos traza, vitaminas y aminoácidos formulado para estimular el crecimiento y coloración de corales duros y blandos.',
    careInstructions:
      'Dosificar 5 ml por cada 80 litros dos veces por semana. Refrigerar después de abrir para preservar vitaminas bioactivas.',
    specs: {
      difficulty: 'Principiante',
      lighting: 'Baja',
      flow: 'Suave',
      placement: 'Fondo / Arena',
    },
  },
];

async function seed() {
  console.log('🌱 Iniciando sembrado de datos en Neon PostgreSQL...');

  try {
    // 1. Insertar Categorías (idempotente mediante onConflictDoNothing)
    console.log(`📦 Insertando ${initialCategories.length} categorías...`);
    const insertedCategories = await db
      .insert(categories)
      .values(initialCategories)
      .onConflictDoNothing({ target: categories.id })
      .returning();

    console.log(
      `✅ Categorías procesadas. (${insertedCategories.length} nuevas insertadas, el resto ya existía)`
    );

    // 2. Insertar Productos (idempotente mediante onConflictDoNothing por slug)
    console.log(`🐠 Insertando ${initialProducts.length} productos marinos...`);
    const insertedProducts = await db
      .insert(products)
      .values(initialProducts)
      .onConflictDoNothing({ target: products.slug })
      .returning();

    console.log(
      `✅ Productos procesados. (${insertedProducts.length} nuevos insertados, el resto ya existía)`
    );

    console.log('🎉 Sembrado completado exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el sembrado de base de datos:', error);
    process.exit(1);
  }
}

seed();
