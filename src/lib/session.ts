import { SignJWT, jwtVerify } from 'jose';

export const ADMIN_SESSION_COOKIE = 'aquapora_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;
const DEVELOPMENT_AUTH_SECRET = 'aquapora-local-development-auth-secret-change-before-production';

export interface AdminSession {
  subject: string;
  role: 'admin';
  expiresAt: Date;
}

function getSessionSecret(): Uint8Array {
  const value = process.env.AUTH_SECRET;

  if (value && value.length >= 32) {
    return new TextEncoder().encode(value);
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET debe tener al menos 32 caracteres en producción.');
  }

  return new TextEncoder().encode(DEVELOPMENT_AUTH_SECRET);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject('aquapora-admin')
    .setIssuer('aquapora-admin')
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verifySessionToken(token?: string): Promise<AdminSession | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ['HS256'],
      issuer: 'aquapora-admin',
    });

    if (payload.sub !== 'aquapora-admin' || payload.role !== 'admin' || !payload.exp) {
      return null;
    }

    return {
      subject: payload.sub,
      role: 'admin',
      expiresAt: new Date(payload.exp * 1000),
    };
  } catch {
    return null;
  }
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_DURATION_SECONDS,
};
