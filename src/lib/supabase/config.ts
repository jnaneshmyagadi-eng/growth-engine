const DEFAULT_URL = "https://ejvyklqdqirxfccevvwv.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdnlrbHFkcWlyeGZjY2V2dnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTYwNTAsImV4cCI6MjA5OTUzMjA1MH0.GrOUQhwMyuLuUhdnk7sf4O3nbcoA22pgWD65AN3o5WQ";

function isValidUrl(v: string): boolean {
  return v.startsWith("https://") && v.includes("supabase");
}
function isValidAnonKey(v: string): boolean {
  return (v.startsWith("eyJ") || v.startsWith("sb_")) && v.length > 40;
}

export const SUPABASE_URL = (() => {
  const e = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return e && isValidUrl(e) ? e : DEFAULT_URL;
})();

export const SUPABASE_ANON_KEY = (() => {
  const e = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return e && isValidAnonKey(e) ? e : DEFAULT_ANON_KEY;
})();

export function isSupabaseConfigured(): boolean {
  return isValidUrl(SUPABASE_URL) && isValidAnonKey(SUPABASE_ANON_KEY);
}
