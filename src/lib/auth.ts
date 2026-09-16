import { cookies } from 'next/headers';
import { scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { Secret, TOTP } from 'otpauth';
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createSessionToken,
  verifySessionToken,
  type AdminSession,
} from './session';

const scrypt = promisify(scryptCallback);

// Safe only for a local, unconfigured development checkout. Production refuses
// to boot with either value absent, preventing accidental deployment with it.
const DEVELOPMENT_PASSWORD = 'aquapora-local-admin-change-me';
const DEVELOPMENT_TOTP_SECRET = 'JBSWY3DPEHPK3PXP';

function safeStringComparison(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}

async function verifyScryptPassword(password: string, encodedHash: string): Promise<boolean> {
  const [, saltBase64, hashBase64] = encodedHash.split('$');
  if (!saltBase64 || !hashBase64) return false;

  try {
    const expected = Buffer.from(hashBase64, 'base64url');
    const actual = (await scrypt(password, Buffer.from(saltBase64, 'base64url'), expected.length)) as Buffer;
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function configuredPassword(): string {
  const value = process.env.ADMIN_PASSWORD_HASH;
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_PASSWORD_HASH debe estar configurada en producción.');
  }
  return DEVELOPMENT_PASSWORD;
}

function configuredTotpSecret(): string {
  const value = process.env.ADMIN_TOTP_SECRET;
  if (value) return value.replace(/\s/g, '').toUpperCase();
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_TOTP_SECRET debe estar configurada en producción.');
  }
  return DEVELOPMENT_TOTP_SECRET;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const expected = configuredPassword();
  if (expected.startsWith('scrypt$')) {
    return verifyScryptPassword(password, expected);
  }
  return safeStringComparison(password, expected);
}

export function verifyTotpCode(code: string): boolean {
  if (!/^\d{6}$/.test(code)) return false;

  try {
    const totp = new TOTP({
      issuer: 'AQUAPORA CORAL FISH',
      label: 'Administrador',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(configuredTotpSecret()),
    });
    return totp.validate({ token: code, window: 1 }) !== null;
  } catch {
    return false;
  }
}

export async function verifyAdminCredentials(password: string, totpCode: string): Promise<boolean> {
  const passwordValid = await verifyAdminPassword(password);
  const totpValid = verifyTotpCode(totpCode);
  return passwordValid && totpValid;
}

export async function createAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, await createSessionToken(), adminSessionCookieOptions);
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, '', { ...adminSessionCookieOptions, maxAge: 0 });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error('No autorizado. Inicia sesión nuevamente.');
  return session;
}

export { ADMIN_SESSION_COOKIE, verifySessionToken };
