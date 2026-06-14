/**
 * Applies supabase/venturo-schema.sql to the database in DATABASE_URL.
 * Run: node --env-file=.env.local scripts/migrate.mjs
 * Idempotent (uses IF NOT EXISTS), and isolated to the `venturo` schema.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, "../supabase/venturo-schema.sql"), "utf8");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (use --env-file=.env.local).");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  await client.query(sql);
  const t = await client.query(
    "select table_name from information_schema.tables where table_schema='venturo' order by 1",
  );
  console.log("✓ Migration applied. venturo tables:", t.rows.map((r) => r.table_name).join(", "));
} catch (e) {
  console.error("✗ Migration failed:", e.message);
  process.exit(1);
} finally {
  await client.end();
}
