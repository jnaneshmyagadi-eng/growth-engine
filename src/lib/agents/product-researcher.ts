import type { ExtractedPage } from "@/lib/research/fetch-product";

export type ProductProfile = {
  homepage_title: string | null;
  homepage_meta_description: string | null;
  pricing_observed: string[];
  features_observed: string[];
  ctas_observed: string[];
  social_links: { platform: string; url: string }[];
  source_url: string;
  what_it_is: string;
  problem_solved: string;
  target_users: string[];
  main_benefits: string[];
  differentiators: string[];
  possible_objections: string[];
  positioning: string;
  conversion_goal: string;
  confidence: number;
  claim_type: "ai_inference";
  reasoning_summary: string;
};

export function analyzeProductPage(page: ExtractedPage): ProductProfile {
  const title = page.title || "";
  const meta = page.metaDescription || "";
  const what =
    `${title}. ${meta}`.trim().slice(0, 280) ||
    page.text.slice(0, 400).replace(/\s+/g, " ").trim() ||
    "Product description could not be extracted from the page.";

  let problem = "Problem statement not clearly stated on the homepage (AI inference limited).";
  const pm = page.text.match(/(?:tired of|struggle with|hard to|solve|help you|makes? it easy)[^.!?]{10,100}/i);
  if (pm) problem = pm[0].trim().slice(0, 200);
  else if (meta) problem = `Addresses needs related to: ${meta.slice(0, 150)}`;

  const users: string[] = [];
  const ure = /\b(founders?|startups?|developers?|marketers?|creators?|teams?|agencies|SaaS|indie hackers?|small businesses?)\b/gi;
  let um;
  while ((um = ure.exec(page.text)) !== null) users.push(um[0]);
  const target_users = [...new Set(users)].slice(0, 8);
  if (target_users.length === 0) target_users.push("Not clearly specified on homepage");

  const benefits = page.featureSignals.filter((f) => f.length > 8).slice(0, 8);
  if (benefits.length === 0 && meta) benefits.push(meta.slice(0, 120));

  const objections: string[] = [];
  if (!page.pricingSignals.length) objections.push("Pricing not visible on homepage — may create friction.");
  if (page.ctaSignals.length === 0) objections.push("No clear primary CTA detected.");
  if (page.text.length < 500) objections.push("Limited public content — hard to evaluate depth of product.");
  objections.push("Trust & social proof not assessed from homepage alone.");

  const ctas = page.ctaSignals.map((c) => c.toLowerCase());
  let conversion_goal = "Primary conversion goal not clearly labeled (inferred: signup or learn more)";
  if (ctas.some((c) => c.includes("demo") || c.includes("book"))) conversion_goal = "Book a demo / sales conversation";
  else if (ctas.some((c) => c.includes("trial") || c.includes("try") || c.includes("free"))) conversion_goal = "Start free trial / signup";
  else if (ctas.some((c) => c.includes("buy") || c.includes("subscribe"))) conversion_goal = "Purchase / subscribe";

  let confidence = 0.3;
  if (page.title) confidence += 0.1;
  if (page.metaDescription) confidence += 0.15;
  if (page.text.length > 800) confidence += 0.15;
  if (page.featureSignals.length > 3) confidence += 0.1;
  if (page.ctaSignals.length > 0) confidence += 0.1;
  if (page.pricingSignals.length > 0) confidence += 0.1;
  confidence = Math.min(0.95, Math.round(confidence * 100) / 100);

  return {
    homepage_title: page.title,
    homepage_meta_description: page.metaDescription,
    pricing_observed: page.pricingSignals,
    features_observed: page.featureSignals,
    ctas_observed: page.ctaSignals,
    social_links: page.socialLinks,
    source_url: page.url,
    what_it_is: what,
    problem_solved: problem,
    target_users,
    main_benefits: benefits,
    differentiators: benefits.length > 0 ? benefits.slice(0, 4) : ["Differentiators not clearly stated on homepage"],
    possible_objections: objections.slice(0, 6),
    positioning: `${what} — focused on ${target_users[0] || "its users"}.`,
    conversion_goal,
    confidence,
    claim_type: "ai_inference",
    reasoning_summary: `Analysis based solely on public homepage content (${page.url}). Title, meta, headings, CTAs, pricing signals and body text were extracted. No external claims invented.`,
  };
}
