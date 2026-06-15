import { Pool, type QueryResult, type QueryResultRow } from "pg";

/**
 * Postgres connection pool (server-only). Points at the shared Supabase
 * Postgres; all Venturo tables live in the isolated `venturo` schema.
 *
 * A global singleton survives Next.js dev hot-reloads so we don't leak pools.
 * `rejectUnauthorized: false` accepts Supabase's TLS without needing the CA
 * bundle (this machine intercepts TLS) — fine for a managed, trusted endpoint.
 */

const globalForDb = globalThis as unknown as { _venturoPool?: Pool };

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!globalForDb._venturoPool) {
    globalForDb._venturoPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      // Small pool: serverless functions are short-lived and the Supabase
      // transaction pooler (recommended for Vercel) multiplexes connections.
      max: 3,
      idleTimeoutMillis: 10_000,
      // No `search_path` startup option here — every query is schema-qualified
      // (venturo.*), which keeps us compatible with pgbouncer transaction mode.
    });
  }
  return globalForDb._venturoPool;
}

/** Run a parameterized query against the venturo schema. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params as never[]);
}

/** Convenience: first row or null. */
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const res = await query<T>(text, params);
  return res.rows[0] ?? null;
}
