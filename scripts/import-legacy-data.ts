/** Go-Live scaffold: validate a normalized export, never writes to Neon yet. */
import { readFile } from 'node:fs/promises';
import { z } from 'zod';

const legacyProduct = z.object({
  legacyId: z.string().min(1), slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(150),
  categoryId: z.enum(['corales-sps', 'corales-lps', 'corales-blandos', 'peces-marinos', 'anemonas', 'invertebrados', 'accesorios', 'alimentos-aditivos']),
  priceCents: z.number().int().nonnegative(), stock: z.number().int().nonnegative(),
  imageUrl: z.string().url(), isSale: z.boolean().default(false),
});
async function main() {
  const file = process.argv[2];
  if (!file || file.startsWith('--')) {
    console.log('Uso: npm run legacy:import -- export.json\nSolo validación. Campos: legacyId, slug, name, categoryId, priceCents, stock, imageUrl, isSale.');
    return;
  }
  if (process.argv.includes('--apply')) throw new Error('Importación deshabilitada hasta implementar y revisar el mapeo del Go-Live.');
  const products = z.array(legacyProduct).parse(JSON.parse(await readFile(file, 'utf8')));
  if (new Set(products.map((item) => item.slug)).size !== products.length || new Set(products.map((item) => item.legacyId)).size !== products.length) throw new Error('El export contiene IDs o slugs duplicados.');
  console.log(`Export válido: ${products.length} productos. No se modificó la base de datos.`);
  // Go-Live: map legacy IDs, copy /api/images assets to Cloudinary, check URLs,
  // compare dry-run report, then transactional upsert with an import manifest.
  // Keep existing test records until the production import is explicitly reviewed.
}
main().catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
