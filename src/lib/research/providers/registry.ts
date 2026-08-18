import type {
  ResearchProviderMeta,
  ProviderSearchQuery,
  ProviderSearchResult,
} from "./types";

function env(...keys: string[]): boolean {
  return keys.every((k) => Boolean(process.env[k]?.trim()));
}

export function listResearchProviders(): ResearchProviderMeta[] {
  return [
    {
      provider: "web_search",
      display_name: "Web Search",
      source_type: "search",
      status: env("SERP_API_KEY") ? "connected" : "not_connected",
      credentials_required: ["SERP_API_KEY"],
      credentials_present: env("SERP_API_KEY"),
      last_success: null,
      last_error: env("SERP_API_KEY") ? null : "Missing: SERP_API_KEY",
      rate_limit: null,
    },
    {
      provider: "reddit",
      display_name: "Reddit",
      source_type: "community",
      status: "not_connected",
      credentials_required: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"],
      credentials_present: false,
      last_success: null,
      last_error: "Not connected",
      rate_limit: null,
    },
  ];
}

export async function runAllProviders(
  q: ProviderSearchQuery
): Promise<ProviderSearchResult[]> {
  return listResearchProviders().map((p) => ({
    provider: p.provider,
    status: p.status,
    items: [],
    error: p.status === "not_connected" ? p.last_error || "Not connected" : undefined,
    retrieved_at: new Date().toISOString(),
  }));
}
