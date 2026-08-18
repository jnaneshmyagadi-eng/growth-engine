/**
 * Public Supabase config for Manthik.
 * Project: ejvyklqdqirxfccevvwv (existing)
 *
 * NEXT_PUBLIC_* values are safe in the browser (anon key is public by design).
 * Prefer Vercel env vars; these defaults keep production working if env was not set.
 * Never put SUPABASE_SERVICE_ROLE_KEY here.
 */

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  "https://ejvyklqdqirxfccevvwv.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdnlrbHFkcWlyeGZjY2V2dnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTYwNTAsImV4cCI6MjA5OTUzMjA1MH0.GrOUQhwMyuLuUhdnk7sf4O3nbcoA22pgWD65AN3o5WQ";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
