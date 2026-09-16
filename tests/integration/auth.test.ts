import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { eq } from 'drizzle-orm';
import { Secret, TOTP } from 'otpauth';
import { db } from '../../src/db';
import { usedTotpSteps } from '../../src/db/schema';
import { verifyAdminCredentials } from '../../src/lib/auth';
import { hashPassword } from '../../src/lib/password';

test('Neon: simultaneous requests cannot reuse a TOTP step', async () => {
  const secret = new Secret({ size: 20 });
  process.env.ADMIN_TOTP_SECRET = secret.base32;
  process.env.ADMIN_PASSWORD_HASH = await hashPassword('isolated-integration-password');
  const key = createHash('sha256').update(secret.base32).digest('hex');
  try {
    const code = new TOTP({ secret }).generate();
    const results = await Promise.all([
      verifyAdminCredentials('isolated-integration-password', code),
      verifyAdminCredentials('isolated-integration-password', code),
    ]);
    assert.equal(results.filter(Boolean).length, 1);
    assert.equal(await verifyAdminCredentials('isolated-integration-password', code), false);
    assert.equal(await verifyAdminCredentials('wrong-password', code), false);
  } finally { await db.delete(usedTotpSteps).where(eq(usedTotpSteps.key, key)); }
});
