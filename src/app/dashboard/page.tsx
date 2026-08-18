import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <header className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <Link href="/" className="font-semibold tracking-tight">
          MANTHIK
        </Link>
        <span className="text-sm text-[var(--muted)]">Dashboard</span>
      </header>
      <h1 className="mt-10 text-2xl font-semibold">Your products</h1>
      <p className="mt-3 text-[var(--muted)] text-sm">
        Full product intelligence pipeline is implemented in the complete local
        source. Connect Supabase env vars and sync the full GitHub tree to enable
        URL onboarding end-to-end.
      </p>
      <Link
        href="/"
        className="inline-block mt-8 rounded-md bg-[var(--accent)] text-[var(--accent-fg)] px-4 py-2 text-sm"
      >
        Back to home
      </Link>
    </main>
  );
}
