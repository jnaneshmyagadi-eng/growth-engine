/**
 * Public Supabase config — Manthik project ejvyklqdqirxfccevvwv
 *
 * Anon key is PUBLIC by design (RLS protects data).
 * Never put SUPABASE_SERVICE_ROLE_KEY here.
 *
 * IMPORTANT: Vercel may have NEXT_PUBLIC_SUPABASE_ANON_KEY mis-set to the
 * project URL. We validate formats so a bad env value cannot break auth.
 */

const DEFAULT_URL = "https://ejvyklqdqirxfccevvwv.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdnlrbHFkcWlyeGZjY2V2dnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTYwNTAsImV4cCI6MjA5OTUzMjA1MH0.GrOUQhwMyuLuUhdnk7sf4O3nbcoA22pgWD65AN3o5WQ";

function isValidUrl(v: string): boolean {
  return v.startsWith("https://") && v.includes("supabase");
}

function isValidAnonKey(v: string): boolean {
  // Legacy JWT anon keys start with eyJ; new publishable keys start with sb_
  return (v.startsWith("eyJ") || v.startsWith("sb_")) && v.length > 40;
}

function resolveUrl(): string {
  // Build-time: Next may inline env. Prefer valid env; else default.
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
      : undefined;
  if (fromEnv && isValidUrl(fromEnv)) return fromEnv;
  return DEFAULT_URL;
}

function resolveAnonKey(): string {
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
      : undefined;
  // If env is missing, empty, or wrongly set to a URL, use the real JWT.
  if (fromEnv && isValidAnonKey(fromEnv)) return fromEnv;
  return DEFAULT_ANON_KEY;
}

export const SUPABASE_URL = resolveUrl();
export const SUPABASE_ANON_KEY = resolveAnonKey();

export function isSupabaseConfigured(): boolean {
  return isValidUrl(SUPABASE_URL) && isValidAnonKey(SUPABASE_ANON_KEY);
}
