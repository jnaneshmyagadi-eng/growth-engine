"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string | null;
  url: string | null;
  status: string;
  growth_score: number | null;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/products");
    if (res.status === 401) {
      router.push("/login?next=/dashboard");
      return;
    }
    const data = await res.json();
    setProducts(data.products || []);
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login?next=/dashboard");
      else setUserEmail(data.user.email || null);
    });
    load();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        setLoading(false);
        return;
      }
      router.push(`/products/${data.id}`);
    } catch {
      setError("Request failed");
      setLoading(false);
    }
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <header className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <Link href="/" className="font-semibold tracking-tight">
          MANTHIK
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[var(--muted)]">{userEmail}</span>
          <button type="button" onClick={logout} className="underline">
            Log out
          </button>
        </div>
      </header>

      <h1 className="mt-10 text-2xl font-semibold">Product Intelligence</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Paste a product URL. Manthik analyzes the public page and builds growth intelligence.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          required
          placeholder="https://yourproduct.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 h-11 px-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-11 px-5 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-medium disabled:opacity-60"
        >
          {loading ? "Analyzing…" : "Analyze product"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <section className="mt-12">
        <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide">
          Your products
        </h2>
        {products.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">No products yet. Add a URL above.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {products.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.id}`}
                  className="block rounded-xl border border-[var(--border)] p-4 hover:bg-[var(--card)]"
                >
                  <div className="font-medium">{p.name || p.url || "Untitled"}</div>
                  <div className="text-xs text-[var(--muted)] mt-1">
                    {p.status} {p.growth_score != null ? `· score ${p.growth_score}` : ""}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
