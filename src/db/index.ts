import * as dotenv from 'dotenv';
import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  dotenv.config({ path: '.env.local', quiet: true });
}

function connectionString() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error('DATABASE_URL debe estar configurada en el servidor.');
  return value;
}

function createDatabase() {
  return drizzle(neon(connectionString()), { schema });
}
export type Database = ReturnType<typeof createDatabase>;
let database: Database | undefined;
// Do not connect during module evaluation or CI builds.
export const db = new Proxy({} as Database, {
  get(_target, property) {
    database ??= createDatabase();
    const value = Reflect.get(database, property);
    return typeof value === 'function' ? value.bind(database) : value;
  },
});

// Pool-backed Neon connections use WebSockets. Node.js 20 and 21 do not
// provide one globally, so configure the supported implementation explicitly.
neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
export function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: connectionString() });
  }
  return pool;
}

export type Transaction = Parameters<
  Parameters<ReturnType<typeof drizzleServerless>['transaction']>[0]
>[0];

export async function runTransaction<T>(
  callback: (tx: Transaction) => Promise<T>
): Promise<T> {
  const p = getPool();
  const txDb = drizzleServerless(p, { schema });
  return await txDb.transaction(callback);
}

export * from './schema';
