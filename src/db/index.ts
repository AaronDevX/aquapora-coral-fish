import * as dotenv from 'dotenv';
import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  dotenv.config({ path: '.env.local' });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not defined in environment variables. Please check your .env.local file.'
  );
}

const client = neon(connectionString);

export const db = drizzle(client, { schema });
export type Database = typeof db;

// Pool-backed Neon connections use WebSockets. Node.js 20 and 21 do not
// provide one globally, so configure the supported implementation explicitly.
neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
export function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString });
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
