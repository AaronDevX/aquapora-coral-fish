import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { SignJWT } from 'jose';
import { Secret, TOTP } from 'otpauth';
import { hashPassword, verifyPassword } from '../src/lib/password';
import { createSessionToken, verifySessionToken } from '../src/lib/session';
import { validateTotpStep } from '../src/lib/auth';
import { createReceiptAccess, verifyReceiptToken, isReceiptCurrent } from '../src/lib/receipt';
import { orderStockChange } from '../src/lib/order-state';
import { categoryIds, normalizeCategory } from '../src/lib/store-config';
import { checkoutSchema } from '../src/lib/validations/checkout';
import { validImageSignature } from '../src/lib/upload-validation';

const testSecret = 'a3'.repeat(32);
process.env.AUTH_SECRET = testSecret;

test('scrypt accepts correct password and rejects plaintext, malformed hashes and wrong passwords', async () => {
  const hash = await hashPassword('a-test-password-with-entropy');
  assert.ok(await verifyPassword('a-test-password-with-entropy', hash));
  assert.equal(await verifyPassword('wrong', hash), false);
  assert.equal(await verifyPassword('plaintext', 'plaintext'), false);
  assert.equal(await verifyPassword('anything', 'scrypt$bad$bad'), false);
  await assert.rejects(hashPassword('short'));
});

test('session validates signature, audience, expiry and subject', async () => {
  const token = await createSessionToken(randomUUID());
  assert.equal((await verifySessionToken(token))?.role, 'admin');
  assert.equal(await verifySessionToken(`${token.slice(0, -10)}XXXXXXXXXX`), null);
  const expired = await new SignJWT({ role: 'admin' }).setProtectedHeader({ alg: 'HS256' })
    .setSubject('aquapora-admin').setIssuer('aquapora-admin').setAudience('aquapora-admin-panel')
    .setJti(randomUUID()).setExpirationTime('1 second ago').sign(new TextEncoder().encode(testSecret));
  assert.equal(await verifySessionToken(expired), null);
  const wrongAudience = await new SignJWT({ role: 'admin' }).setProtectedHeader({ alg: 'HS256' })
    .setSubject('aquapora-admin').setIssuer('aquapora-admin').setAudience('other').setJti(randomUUID())
    .setExpirationTime('1h').sign(new TextEncoder().encode(testSecret));
  assert.equal(await verifySessionToken(wrongAudience), null);
});

test('missing session secret fails closed', async () => {
  delete process.env.AUTH_SECRET;
  await assert.rejects(createSessionToken(randomUUID()));
  process.env.AUTH_SECRET = testSecret;
});

test('TOTP checks token format, clock window and missing configuration', () => {
  const secret = new Secret({ size: 20 });
  process.env.ADMIN_TOTP_SECRET = secret.base32;
  const totp = new TOTP({ secret, period: 30, digits: 6, algorithm: 'SHA1' });
  const timestamp = 1_800_000_000_000;
  assert.equal(validateTotpStep(totp.generate({ timestamp }), timestamp), timestamp / 30000);
  assert.equal(validateTotpStep(totp.generate({ timestamp: timestamp - 90_000 }), timestamp), null);
  assert.equal(validateTotpStep('invalid', timestamp), null);
  delete process.env.ADMIN_TOTP_SECRET;
  assert.equal(validateTotpStep('123456', timestamp), null);
});

test('receipt access requires the secret token and expires after 30 days', () => {
  const first = createReceiptAccess(); const second = createReceiptAccess();
  assert.equal(first.token.length, 43);
  assert.ok(verifyReceiptToken(first.token, first.hash));
  assert.equal(verifyReceiptToken(second.token, first.hash), false);
  assert.equal(verifyReceiptToken(undefined, first.hash), false);
  assert.equal(verifyReceiptToken(first.token, null), false);
  assert.equal(isReceiptCurrent(new Date(0), 31 * 86400000), false);
});

test('stock changes exactly once for confirmation, direct completion and cancellation', () => {
  assert.equal(orderStockChange('pending', 'confirmed', false), 'deducted');
  assert.equal(orderStockChange('pending', 'completed', false), 'deducted');
  assert.equal(orderStockChange('confirmed', 'completed', true), 'none');
  assert.equal(orderStockChange('completed', 'completed', true), 'none');
  assert.equal(orderStockChange('completed', 'cancelled', true), 'restored');
  assert.equal(orderStockChange('cancelled', 'cancelled', false), 'none');
  assert.equal(orderStockChange('pending', 'cancelled', false), 'none');
  assert.throws(() => orderStockChange('cancelled', 'confirmed', false));
  assert.throws(() => orderStockChange('confirmed', 'pending', true));
  assert.throws(() => orderStockChange('completed', 'confirmed', true));
});

test('public categories support groups and legacy names', () => {
  assert.deepEqual(categoryIds('Corales'), ['corales-sps', 'corales-lps', 'corales-blandos']);
  assert.deepEqual(categoryIds('Peces'), ['peces-marinos']);
  assert.deepEqual(categoryIds('Anémonas'), ['anemonas']);
  assert.deepEqual(categoryIds('anemonas-invertebrados'), ['anemonas', 'invertebrados', 'anemonas-invertebrados']);
  assert.equal(normalizeCategory(' Anémonas '), 'anemonas');
});

test('checkout rejects duplicates, fractional quantities and unbounded carts', () => {
  const item = { productId: randomUUID(), quantity: 1 };
  const data = { customerName: 'Cliente Prueba', customerPhone: '999999999', customerAddress: 'Dirección de prueba 123', customerDistrict: 'Lima', shippingMethod: 'pickup', items: [item] };
  assert.ok(checkoutSchema.safeParse(data).success);
  assert.equal(checkoutSchema.safeParse({ ...data, items: [item, item] }).success, false);
  assert.equal(checkoutSchema.safeParse({ ...data, items: [{ ...item, quantity: 0.5 }] }).success, false);
  assert.equal(checkoutSchema.safeParse({ ...data, items: Array.from({ length: 101 }, () => ({ ...item, productId: randomUUID() })) }).success, false);
});

test('uploads reject spoofed image MIME types and SVG scripts', () => {
  assert.equal(validImageSignature(Buffer.from('<svg><script>alert(1)</script></svg>'), 'image/png'), false);
  assert.equal(validImageSignature(Buffer.from('<svg/>'), 'image/svg+xml'), false);
  assert.ok(validImageSignature(Buffer.from([137,80,78,71,13,10,26,10]), 'image/png'));
});
