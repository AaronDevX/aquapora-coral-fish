import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse } from 'dotenv';
import { verifyPassword } from '../src/lib/password';

test('admin setup preserves service keys, escapes hash, creates private credentials and is idempotent', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'aquapora-setup-'));
  try {
    const env = join(directory, '.env.local'); const output = join(directory, 'access.txt');
    const original = '# Keep these service keys\nDATABASE_URL="postgres://test"\nCLOUDINARY_API_SECRET="test-only"\n';
    await writeFile(env, original);
    const first = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/setup-admin.ts', '--env', env, '--output', output], { encoding: 'utf8' });
    assert.equal(first.status, 0, first.stderr);
    const contents = await readFile(env, 'utf8');
    assert.ok(contents.startsWith(original));
    const values = parse(contents);
    assert.match(values.AUTH_SECRET, /^[a-f0-9]{64}$/);
    assert.match(values.ADMIN_TOTP_SECRET, /^[A-Z2-7]{32}$/);
    const access = await readFile(output, 'utf8');
    const password = access.match(/Contraseña: (.+)/)?.[1];
    assert.ok(password);
    assert.ok(await verifyPassword(password, values.ADMIN_PASSWORD_HASH.replace(/\\\$/g, '$')));
    assert.equal((await stat(env)).mode & 0o777, 0o600);
    assert.equal((await stat(output)).mode & 0o777, 0o600);
    const second = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/setup-admin.ts', '--env', env, '--output', join(directory, 'second.txt')], { encoding: 'utf8' });
    assert.equal(second.status, 0, second.stderr);
    assert.equal(await readFile(env, 'utf8'), contents);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
