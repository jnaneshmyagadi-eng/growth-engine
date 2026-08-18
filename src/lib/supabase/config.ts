/**
 * Public Supabase config — Manthik project ejvyklqdqirxfccevvwv
 *
 * Anon key is PUBLIC by design (RLS protects data).
 * Never put SUPABASE_SERVICE_ROLE_KEY here.
 *
 * Hardcoded defaults ensure production works even when Vercel env vars
 * are missing or empty. Env vars still override when set to a real value.
 */

const DEFAULT_URL = "https://ejvyklqdqirxfccevvwv.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdnlrbHFkcWlyeGZjY2V2dnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTYwNTAsImV4cCI6MjA5OTUzMjA1MH0.GrOUQhwMyuLuUhdnk7sf4O3nbcoA22pgWD65AN3o5WQ";

function pickEnv(value: string | undefined, fallback: string): string {
  const v = value?.trim();
  if (!v || v === "undefined" || v === "null") return fallback;
  return v;
}

export const SUPABASE_URL = pickEnv(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  DEFAULT_URL
);

export const SUPABASE_ANON_KEY = pickEnv(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  DEFAULT_ANON_KEY
);

export function isSupabaseConfigured(): boolean {
  return (
    SUPABASE_URL.startsWith("https://") &&
    SUPABASE_ANON_KEY.length > 20
  );
}
