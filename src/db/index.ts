import * as dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
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
export * from './schema';
