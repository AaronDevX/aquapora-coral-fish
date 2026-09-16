import { randomBytes, scryptSync } from 'node:crypto';

const password = process.argv[2];

if (!password || password.length < 12) {
  console.error('Uso: npm run auth:hash -- "una-contraseña-de-al-menos-12-caracteres"');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
console.log(`scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`);
