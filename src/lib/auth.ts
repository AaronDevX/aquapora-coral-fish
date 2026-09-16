import { cookies, headers } from 'next/headers';
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { Secret, TOTP } from 'otpauth';
import { and, eq, gt, lt, sql } from 'drizzle-orm';
import { db } from '@/db';
import { adminSessions, authRateLimits, usedTotpSteps } from '@/db/schema';
import { verifyPassword } from './password';
import {
  ADMIN_SESSION_COOKIE, adminSessionCookieOptions, createSessionToken,
  verifySessionToken, type AdminSession,
} from './session';

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return verifyPassword(password, process.env.ADMIN_PASSWORD_HASH ?? '');
}

export function validateTotpStep(code: string, timestamp = Date.now()): number | null {
  const secret = process.env.ADMIN_TOTP_SECRET;
  if (!/^\d{6}$/.test(code) || !secret || !/^[A-Z2-7]{32,}$/.test(secret)) return null;
  try {
    const totp = new TOTP({ issuer: 'AQUAPORA CORAL FISH', label: 'Administrador',
      algorithm: 'SHA1', digits: 6, period: 30, secret: Secret.fromBase32(secret) });
    const delta = totp.validate({ token: code, window: 1, timestamp });
    return delta === null ? null : Math.floor(timestamp / 30_000) + delta;
  } catch { return null; }
}

async function takeAttempt(key: string, limit: number) {
  const rows = await db.insert(authRateLimits).values({ key, attempts: 1, windowStart: new Date() })
    .onConflictDoUpdate({ target: authRateLimits.key, set: {
      attempts: sql`case when ${authRateLimits.windowStart} < now() - interval '15 minutes' then 1 else least(${authRateLimits.attempts} + 1, 10000) end`,
      windowStart: sql`case when ${authRateLimits.windowStart} < now() - interval '15 minutes' then now() else ${authRateLimits.windowStart} end`,
    } }).returning({ attempts: authRateLimits.attempts });
  return rows[0].attempts <= limit;
}

export async function allowLoginAttempt() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  const requestHeaders = await headers();
  // Only trust the header injected by Netlify; never arbitrary X-Forwarded-For.
  const ip = process.env.NETLIFY === 'true'
    ? requestHeaders.get('x-nf-client-connection-ip') ?? 'unknown'
    : 'local';
  const key = createHmac('sha256', secret).update(ip).digest('hex');
  await db.delete(authRateLimits).where(lt(authRateLimits.windowStart, new Date(Date.now() - 86_400_000)));
  const globalAllowed = await takeAttempt('admin-global', 100);
  if (!globalAllowed) return false;
  return takeAttempt(`admin:${key}`, 10);
}

export async function verifyAdminCredentials(password: string, code: string): Promise<boolean> {
  if (!(await verifyAdminPassword(password))) return false;
  const step = validateTotpStep(code);
  if (step === null) return false;
  const key = createHash('sha256').update(process.env.ADMIN_TOTP_SECRET!).digest('hex');
  const rows = await db.insert(usedTotpSteps).values({ key, step }).onConflictDoUpdate({
    target: usedTotpSteps.key, set: { step }, setWhere: lt(usedTotpSteps.step, step),
  }).returning({ key: usedTotpSteps.key });
  return rows.length === 1;
}

export async function createAdminSession(): Promise<void> {
  const id = randomUUID();
  const token = await createSessionToken(id);
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
  await db.insert(adminSessions).values({ id, expiresAt: new Date(Date.now() + adminSessionCookieOptions.maxAge * 1000) });
  (await cookies()).set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions);
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  try {
    if (session) await db.delete(adminSessions).where(eq(adminSessions.id, session.id));
  } finally {
    cookieStore.set(ADMIN_SESSION_COOKIE, '', { ...adminSessionCookieOptions, maxAge: 0 });
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await verifySessionToken((await cookies()).get(ADMIN_SESSION_COOKIE)?.value);
  if (!session || !/^[a-f0-9-]{36}$/.test(session.id)) return null;
  const rows = await db.select({ id: adminSessions.id }).from(adminSessions)
    .where(and(eq(adminSessions.id, session.id), gt(adminSessions.expiresAt, new Date()))).limit(1);
  return rows.length ? session : null;
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error('No autorizado. Inicia sesión nuevamente.');
  return session;
}

export { ADMIN_SESSION_COOKIE, verifySessionToken };
