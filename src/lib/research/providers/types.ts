/**
 * Research provider adapter contract.
 * Each external source implements this. Missing credentials → status "not_connected".
 * Never fabricate results.
 */

export type ProviderStatus =
  | "connected"
  | "not_connected"
  | "error"
  | "rate_limited"
  | "disabled";

export type ResearchProviderMeta = {
  provider: string;
  display_name: string;
  source_type: string;
  status: ProviderStatus;
  credentials_required: string[];
  credentials_present: boolean;
  last_success: string | null;
  last_error: string | null;
  rate_limit: string | null;
  docs_url?: string;
};

export type ProviderSearchQuery = {
  query: string;
  productUrl?: string;
  productName?: string;
  limit?: number;
};

export type ProviderResultItem = {
  title: string;
  url: string;
  snippet: string;
  published_at?: string | null;
  metadata?: Record<string, unknown>;
};

export type ProviderSearchResult = {
  provider: string;
  status: ProviderStatus;
  items: ProviderResultItem[];
  error?: string;
  retrieved_at: string;
};

export interface ResearchProvider {
  meta(): ResearchProviderMeta;
  search(q: ProviderSearchQuery): Promise<ProviderSearchResult>;
}
