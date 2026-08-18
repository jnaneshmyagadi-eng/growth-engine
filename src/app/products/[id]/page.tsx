"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Payload = {
  product: {
    id: string;
    name: string | null;
    url: string | null;
    status: string;
    growth_score: number | null;
  };
  analysis: {
    what_it_is: string;
    problem_solved: string;
    target_users: string[];
    main_benefits: string[];
    differentiators: string[];
    possible_objections: string[];
    positioning: string;
    conversion_goal: string;
    confidence: number;
    claim_type: string;
    reasoning_summary: string;
    source_data?: Record<string, unknown>;
  } | null;
  audiences: { name: string; description: string; claim_type?: string }[];
  strategies: { name: string; summary: string; channels: string[]; evidence?: string }[];
  recommendations: { title: string; description: string; priority: string }[];
  tasks: { agent_type: string; status: string; error: string | null }[];
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch(`/api/products/${id}`);
      if (res.status === 401) {
        router.push(`/login?next=/products/${id}`);
        return;
      }
      if (!res.ok) {
        setError("Failed to load product");
        return;
      }
      const json = await res.json();
      if (!cancelled) setData(json);
      if (json.product?.status === "analyzing" || json.product?.status === "pending") {
        setTimeout(load, 2500);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (error) {
    return (
      <main className="min-h-screen p-8">
        <p className="text-red-600">{error}</p>
        <Link href="/dashboard">Back</Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center text-sm text-[var(--muted)]">
        Loading product intelligence…
      </main>
    );
  }

  const { product, analysis, audiences, strategies, recommendations, tasks } = data;

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <header className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <Link href="/dashboard" className="text-sm text-[var(--muted)]">
          ← Dashboard
        </Link>
        <span className="text-xs uppercase tracking-wide text-[var(--muted)]">{product.status}</span>
      </header>

      <h1 className="mt-8 text-2xl font-semibold">{product.name || "Product"}</h1>
      {product.url && (
        <a href={product.url} target="_blank" rel="noreferrer" className="text-sm text-[var(--muted)] underline">
          {product.url}
        </a>
      )}
      {product.growth_score != null && (
        <p className="mt-2 text-sm">Growth confidence score: {product.growth_score}</p>
      )}

      {(product.status === "analyzing" || product.status === "pending") && (
        <p className="mt-6 text-sm text-[var(--muted)]">Pipeline running… results will appear when ready.</p>
      )}

      {analysis && (
        <section className="mt-10 space-y-6">
          <div className="rounded-xl border border-[var(--border)] p-4">
            <div className="text-xs uppercase text-[var(--muted)]">What it is · {analysis.claim_type}</div>
            <p className="mt-2 text-sm">{analysis.what_it_is}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-4">
            <div className="text-xs uppercase text-[var(--muted)]">Problem solved</div>
            <p className="mt-2 text-sm">{analysis.problem_solved}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-4">
            <div className="text-xs uppercase text-[var(--muted)]">Target users</div>
            <ul className="mt-2 text-sm list-disc pl-5">
              {analysis.target_users?.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-4">
            <div className="text-xs uppercase text-[var(--muted)]">Benefits</div>
            <ul className="mt-2 text-sm list-disc pl-5">
              {analysis.main_benefits?.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-4">
            <div className="text-xs uppercase text-[var(--muted)]">Conversion goal</div>
            <p className="mt-2 text-sm">{analysis.conversion_goal}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-4">
            <div className="text-xs uppercase text-[var(--muted)]">Explain why</div>
            <p className="mt-2 text-sm text-[var(--muted)]">{analysis.reasoning_summary}</p>
            <p className="mt-1 text-xs">Confidence: {analysis.confidence}</p>
          </div>
        </section>
      )}

      {audiences.length > 0 && (
        <section className="mt-10">
          <h2 className="font-semibold">Audiences</h2>
          <ul className="mt-3 space-y-2">
            {audiences.map((a, i) => (
              <li key={i} className="rounded-xl border border-[var(--border)] p-3 text-sm">
                <div className="font-medium">{a.name}</div>
                <div className="text-[var(--muted)] text-xs mt-1">{a.description}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {strategies.length > 0 && (
        <section className="mt-10">
          <h2 className="font-semibold">Strategy</h2>
          {strategies.map((s, i) => (
            <div key={i} className="mt-3 rounded-xl border border-[var(--border)] p-4 text-sm">
              <div className="font-medium">{s.name}</div>
              <p className="mt-2">{s.summary}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">Channels: {(s.channels || []).join(", ")}</p>
            </div>
          ))}
        </section>
      )}

      {recommendations.length > 0 && (
        <section className="mt-10">
          <h2 className="font-semibold">Next best actions</h2>
          <ul className="mt-3 space-y-2">
            {recommendations.map((r, i) => (
              <li key={i} className="rounded-xl border border-[var(--border)] p-3 text-sm">
                <div className="font-medium">{r.title}</div>
                <p className="text-[var(--muted)] mt-1">{r.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tasks.length > 0 && (
        <section className="mt-10 mb-16">
          <h2 className="text-sm font-medium text-[var(--muted)]">Agent tasks</h2>
          <ul className="mt-2 text-xs space-y-1">
            {tasks.map((t, i) => (
              <li key={i}>
                {t.agent_type}: {t.status}
                {t.error ? ` — ${t.error}` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
