export type UtmParams = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content?: string;
  utm_term?: string;
};

export function buildUtm(params: {
  platform: string;
  campaignName: string;
  contentVariant?: string;
  medium?: string;
}): UtmParams {
  const slug = params.campaignName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
  return {
    utm_source: params.platform.toLowerCase().replace(/\s+/g, "_"),
    utm_medium: params.medium || "organic",
    utm_campaign: slug || "campaign",
    utm_content: params.contentVariant
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .slice(0, 30),
  };
}

export function appendUtm(url: string, utm: UtmParams): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", utm.utm_source);
    u.searchParams.set("utm_medium", utm.utm_medium);
    u.searchParams.set("utm_campaign", utm.utm_campaign);
    if (utm.utm_content) u.searchParams.set("utm_content", utm.utm_content);
    if (utm.utm_term) u.searchParams.set("utm_term", utm.utm_term);
    return u.toString();
  } catch {
    return url;
  }
}
