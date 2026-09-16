import assert from 'node:assert/strict';
const base = process.env.SMOKE_BASE_URL;
if (!base || !/^https?:\/\//.test(base)) throw new Error('Configura SMOKE_BASE_URL.');
for (const path of ['/', '/catalogo', '/catalogo?categoria=corales', '/catalogo?ofertas=true', '/favoritos', '/contacto']) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  const html = await response.text();
  assert.ok(html.includes('AQUAPORA'), `${path}: contenido incompleto`);
  console.log(`OK ${path}`);
}
const admin = await fetch(new URL('/admin/productos', base), { redirect: 'manual' });
assert.ok([302, 303, 307, 308].includes(admin.status));
assert.ok(admin.headers.get('location')?.includes('/admin/login'));
const receipt = await fetch(new URL('/pedido/AQ-20260916-AAAA', base));
assert.equal(receipt.status, 404);
assert.match(receipt.headers.get('cache-control') ?? '', /no-store/);
assert.match(receipt.headers.get('x-robots-tag') ?? '', /noindex/);
console.log('OK acceso administrativo y privacidad de comprobantes');
