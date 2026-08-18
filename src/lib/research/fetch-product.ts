export type ExtractedPage = {
  url: string;
  title: string | null;
  metaDescription: string | null;
  text: string;
  htmlExcerpt: string;
  pricingSignals: string[];
  featureSignals: string[];
  ctaSignals: string[];
  socialLinks: { platform: string; url: string }[];
  headings: string[];
};

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(html: string, name: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m?.[1] ? stripTags(m[1]).trim() : null;
}

function extractHeadings(html: string): string[] {
  const heads: string[] = [];
  const re = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const t = stripTags(m[1]).trim();
    if (t && t.length < 200) heads.push(t);
  }
  return [...new Set(heads)].slice(0, 30);
}

function extractLinks(html: string): { platform: string; url: string }[] {
  const social: { platform: string; url: string }[] = [];
  const re = /href=["'](https?:\/\/[^"']+)["']/gi;
  let m;
  const seen = new Set<string>();
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    if (seen.has(href)) continue;
    seen.add(href);
    const lower = href.toLowerCase();
    if (lower.includes("twitter.com") || lower.includes("x.com"))
      social.push({ platform: "x", url: href });
    else if (lower.includes("linkedin.com"))
      social.push({ platform: "linkedin", url: href });
    else if (lower.includes("instagram.com"))
      social.push({ platform: "instagram", url: href });
    else if (lower.includes("youtube.com") || lower.includes("youtu.be"))
      social.push({ platform: "youtube", url: href });
    else if (lower.includes("github.com"))
      social.push({ platform: "github", url: href });
  }
  return social.slice(0, 12);
}

function findPricingSignals(text: string): string[] {
  const out: string[] = [];
  const re = /(?:\$|\u20ac|\u00a3)\s?\d+[\d,]*(?:\.\d{2})?(?:\s*\/\s*(?:mo|month|yr|year))?|free(?:\s+trial)?|from\s+\$?\d+/gi;
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[0]);
  return [...new Set(out)].slice(0, 10);
}

function findCtaSignals(html: string, text: string): string[] {
  const ctas: string[] = [];
  const re = /<(?:a|button)[^>]*>([\s\S]*?)<\/(?:a|button)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const t = stripTags(m[1]).trim();
    if (t && t.length < 80 && /start|sign|try|get|book|join|free|demo|subscribe|buy/i.test(t))
      ctas.push(t);
  }
  const textCtas = text.match(/\b(?:Get started|Try (?:for )?free|Sign up|Book a demo|Start free|Request access)\b/gi);
  if (textCtas) ctas.push(...textCtas);
  return [...new Set(ctas)].slice(0, 12);
}

function findFeatureSignals(text: string, headings: string[]): string[] {
  const features: string[] = [];
  for (const h of headings) {
    if (h.length > 4 && h.length < 80 && !/^(home|about|blog|pricing|contact|login|sign)/i.test(h))
      features.push(h);
  }
  return [...new Set(features)].slice(0, 20);
}

export async function fetchAndExtractProduct(productUrl: string): Promise<ExtractedPage> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let html = "";
  try {
    const res = await fetch(productUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "ManthikBot/1.0 (+https://manthik.vercel.app; product analysis)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`Failed to fetch product page: HTTP ${res.status}`);
    html = await res.text();
  } finally {
    clearTimeout(timeout);
  }
  if (html.length > 500_000) html = html.slice(0, 500_000);
  const title = extractTitle(html);
  const metaDescription = extractMeta(html, "description") || extractMeta(html, "og:description");
  const text = stripTags(html).slice(0, 25000);
  const headings = extractHeadings(html);
  const socialLinks = extractLinks(html);
  return {
    url: productUrl,
    title,
    metaDescription,
    text,
    htmlExcerpt: html.slice(0, 8000),
    pricingSignals: findPricingSignals(text),
    featureSignals: findFeatureSignals(text, headings),
    ctaSignals: findCtaSignals(html, text),
    socialLinks,
    headings,
  };
}
