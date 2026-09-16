import { SignJWT, jwtVerify } from 'jose';

export const ADMIN_SESSION_COOKIE = 'aquapora_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;


export interface AdminSession {
  subject: string;
  id: string;
  role: 'admin';
  expiresAt: Date;
}

function getSessionSecret(): Uint8Array {
  const value = process.env.AUTH_SECRET;

  if (!value || !/^[a-f0-9]{64}$/i.test(value)) {
    throw new Error('Configura AUTH_SECRET con npm run admin:setup.');
  }
  return new TextEncoder().encode(value);
}

export async function createSessionToken(id: string): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject('aquapora-admin')
    .setAudience('aquapora-admin-panel')
    .setJti(id)
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
      audience: 'aquapora-admin-panel',
    });

    if (payload.sub !== 'aquapora-admin' || payload.role !== 'admin' || !payload.exp || !payload.jti) {
      return null;
    }

    return {
      subject: payload.sub,
      id: payload.jti,
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
