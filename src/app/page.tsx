import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div className="font-semibold tracking-tight">MANTHIK</div>
        <nav className="flex gap-4 text-sm">
          <Link href="/login" className="text-[var(--muted)] hover:text-[var(--foreground)]">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-[var(--accent-fg)]"
          >
            Get started
          </Link>
        </nav>
      </header>
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
          AI Growth Team
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Turn your product into customers
        </h1>
        <p className="mt-6 text-lg text-[var(--muted)]">
          Give Manthik your product. It researches your market, finds your customers,
          builds growth experiments, and helps you learn what actually works.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-fg)]"
          >
            Start with your product URL
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-[var(--border)] px-5 py-2.5 text-sm"
          >
            Log in
          </Link>
        </div>
        <p className="mt-12 text-xs text-[var(--muted)]">
          Not an AI content generator. A growth system with research, approval gates, and real metrics.
        </p>
      </section>
    </main>
  );
}
