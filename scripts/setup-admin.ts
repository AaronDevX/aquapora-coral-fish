import { randomBytes } from 'node:crypto';
import { chmod, readFile, rename, writeFile, lstat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parse } from 'dotenv';
import { Secret, TOTP } from 'otpauth';
import { hashPassword, PASSWORD_HASH_PATTERN } from '../src/lib/password';

async function main() {
  const args = process.argv.slice(2);
  const envIndex = args.indexOf('--env');
  const outputIndex = args.indexOf('--output');
  if ((envIndex >= 0 && !args[envIndex + 1]) || (outputIndex >= 0 && !args[outputIndex + 1])) throw new Error('Falta la ruta de archivo.');
  const envPath = resolve(envIndex >= 0 ? args[envIndex + 1] : '.env.local');
  const outputPath = outputIndex >= 0 ? resolve(args[outputIndex + 1]) : null;
  if (outputPath === envPath) throw new Error('El archivo de acceso debe ser distinto del archivo de entorno.');
  if (outputPath && await lstat(outputPath).then(() => true, (error: NodeJS.ErrnoException) => { if (error.code === 'ENOENT') return false; throw error; })) throw new Error('El archivo de acceso ya existe; elige otra ruta para conservarlo.');
  const original = await readFile(envPath, 'utf8').catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return ''; throw error;
  });
  const existing = parse(original);
  const password = existing.ADMIN_PASSWORD_HASH ? null : randomBytes(24).toString('base64url');
  const hash = existing.ADMIN_PASSWORD_HASH?.replace(/\\\$/g, '$') ?? await hashPassword(password!);
  const auth = existing.AUTH_SECRET ?? randomBytes(32).toString('hex');
  const totp = existing.ADMIN_TOTP_SECRET ?? new Secret({ size: 20 }).base32;
  if (!PASSWORD_HASH_PATTERN.test(hash)) throw new Error('ADMIN_PASSWORD_HASH existente no es un hash scrypt válido; no se sobrescribió.');
  if (!/^[a-f0-9]{64}$/i.test(auth)) throw new Error('AUTH_SECRET existente no contiene 32 bytes hex; no se sobrescribió.');
  if (!/^[A-Z2-7]{32,}$/.test(totp)) throw new Error('ADMIN_TOTP_SECRET existente no es válido; no se sobrescribió.');
  const values = { AUTH_SECRET: auth, ADMIN_PASSWORD_HASH: hash, ADMIN_TOTP_SECRET: totp };
  const additions = Object.entries(values).filter(([key]) => !(key in existing))
    .map(([key, value]) => `${key}="${value.replace(/\$/g, '\\$')}"`);
  if (additions.length) {
    const temporary = `${envPath}.${randomBytes(6).toString('hex')}.tmp`;
    await writeFile(temporary, `${original}${original.endsWith('\n') || !original ? '' : '\n'}${additions.join('\n')}\n`, { mode: 0o600, flag: 'wx' });
    await rename(temporary, envPath);
  }
  await chmod(envPath, 0o600);
  const uri = new TOTP({ issuer: 'AQUAPORA CORAL FISH', label: 'Administrador',
    algorithm: 'SHA1', digits: 6, period: 30, secret: Secret.fromBase32(totp) }).toString();
  const instructions = `Acceso local AQUAPORA — conservar en privado\nRuta: /admin/login\nContraseña: ${password ?? '(existente, conservada)'}\nGoogle Authenticator: ${uri}\n\nImporta el secreto y utiliza el código de seis dígitos. No reutilices estas credenciales en producción.\n`;
  if (outputPath) {
    await writeFile(outputPath, instructions, { mode: 0o600, flag: 'wx' });
    console.log(`Configuración lista. Datos de acceso privados en ${outputPath}`);
  } else {
    console.log(instructions);
  }
  console.log(`Variables añadidas: ${additions.length}. Neon y Cloudinary conservados.`);
}
main().catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
