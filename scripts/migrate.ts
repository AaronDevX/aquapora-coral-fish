import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { getPool } from '../src/db';

async function main() {
  const pool = getPool();
  const connection = await pool.connect();
  try {
    await connection.query('BEGIN');
    await connection.query("SELECT pg_advisory_xact_lock(hashtext('aquapora-migrations'))");
    await connection.query('CREATE TABLE IF NOT EXISTS aquapora_migrations (name text PRIMARY KEY, hash text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    const files = (await readdir('drizzle')).filter((file) => file.endsWith('.sql')).sort();
    for (const file of files) {
      const contents = await readFile(`drizzle/${file}`, 'utf8');
      const hash = createHash('sha256').update(contents).digest('hex');
      const existing = await connection.query<{ hash: string }>('SELECT hash FROM aquapora_migrations WHERE name = $1', [file]);
      if (existing.rows.length) {
        if (existing.rows[0].hash !== hash) throw new Error(`La migración aplicada ${file} fue modificada.`);
        continue;
      }
      for (const statement of contents.split('--> statement-breakpoint').filter((part) => part.trim())) await connection.query(statement);
      await connection.query('INSERT INTO aquapora_migrations (name, hash) VALUES ($1, $2)', [file, hash]);
      console.log(`Aplicada: ${file}`);
    }
    await connection.query('COMMIT');
    console.log('Migraciones completas. Productos y pedidos conservados.');
  } catch (error) {
    await connection.query('ROLLBACK');
    throw error;
  } finally { connection.release(); await pool.end(); }
}
main().catch(() => { console.error('Migración cancelada y revertida. Comprueba conectividad, esquema y clasificación de categorías.'); process.exitCode = 1; });
