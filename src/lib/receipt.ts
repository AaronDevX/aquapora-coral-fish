import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export function createReceiptAccess() {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashReceiptToken(token) };
}

export function hashReceiptToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function verifyReceiptToken(token: string | undefined, hash: string | null) {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token) || !hash || !/^[a-f0-9]{64}$/.test(hash)) return false;
  return timingSafeEqual(Buffer.from(hashReceiptToken(token), 'hex'), Buffer.from(hash, 'hex'));
}

export function receiptCookieName(id: string) { return `aq_receipt_${id.replace(/[^A-Za-z0-9_-]/g, '')}`; }

export function isReceiptCurrent(createdAt: Date, now = Date.now()) { return createdAt.getTime() >= now - 30 * 86400000; }
