export type IntegrationPlatform =
  | "x"
  | "linkedin"
  | "instagram"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "reddit"
  | "producthunt"
  | "meta_ads"
  | "google_ads";

export type ConnectionStatus =
  | "not_connected"
  | "connected"
  | "expired"
  | "error"
  | "pending";

export type IntegrationMeta = {
  platform: IntegrationPlatform;
  display_name: string;
  status: ConnectionStatus;
  credentials_required: string[];
  supports_publish: boolean;
  supports_analytics: boolean;
  oauth_required: boolean;
  fallback: ("copy" | "download" | "open_platform")[];
  docs_url?: string;
  last_error?: string | null;
};

export type PublishRequest = {
  platform: IntegrationPlatform;
  content: string;
  account_id?: string;
  scheduled_at?: string | null;
  media_urls?: string[];
};

export type PublishResult = {
  status: "published" | "scheduled" | "failed" | "not_connected" | "needs_manual";
  external_id?: string | null;
  error?: string;
  fallback_actions?: string[];
};

export type MetricSource = "live" | "user_entered" | "imported" | "estimated";

export type MetricPoint = {
  name: string;
  value: number;
  source: MetricSource;
  unit?: string;
  recorded_at: string;
  campaign_id?: string;
  platform?: string;
};
