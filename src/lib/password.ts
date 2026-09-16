import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
export const PASSWORD_HASH_PATTERN = /^scrypt\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{86}$/;

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12 || password.length > 512) throw new Error('Usa una contraseña de 12 a 512 caracteres.');
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64) as Buffer;
  return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  if (!PASSWORD_HASH_PATTERN.test(encodedHash) || password.length > 512) return false;
  const [, salt, encoded] = encodedHash.split('$');
  const expected = Buffer.from(encoded, 'base64url');
  const actual = await scrypt(password, Buffer.from(salt, 'base64url'), 64) as Buffer;
  return timingSafeEqual(actual, expected);
}
