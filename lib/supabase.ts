import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client factories.
 *
 * Persistence is optional in the MVP — the app runs entirely on client storage
 * until these env vars are set. `isSupabaseConfigured()` lets API routes return
 * a clear 503 instead of crashing when the project isn't wired up yet.
 *
 * Required env (see .env.example):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY   (server-only, optional)
 */

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Browser/anon client — respects row-level security. */
export function createBrowserSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: true, autoRefreshToken: true } },
  );
}

/**
 * Server client. Uses the service-role key when available (bypasses RLS for
 * trusted server logic); otherwise falls back to the anon key.
 */
export function createServerSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
