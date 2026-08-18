import type { IntegrationMeta, PublishRequest, PublishResult } from "./types";

function has(...keys: string[]) {
  return keys.every((k) => Boolean(process.env[k]?.trim()));
}

export function listIntegrations(): IntegrationMeta[] {
  return [
    {
      platform: "x",
      display_name: "X (Twitter)",
      status: has("X_CLIENT_ID", "X_CLIENT_SECRET") ? "connected" : "not_connected",
      credentials_required: ["X_CLIENT_ID", "X_CLIENT_SECRET"],
      supports_publish: true,
      supports_analytics: true,
      oauth_required: true,
      fallback: ["copy", "open_platform"],
    },
    {
      platform: "linkedin",
      display_name: "LinkedIn",
      status: has("LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET") ? "connected" : "not_connected",
      credentials_required: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"],
      supports_publish: true,
      supports_analytics: true,
      oauth_required: true,
      fallback: ["copy", "open_platform"],
    },
  ];
}

export async function publishContent(_req: PublishRequest): Promise<PublishResult> {
  return {
    status: "needs_manual",
    error: "OAuth not connected. Use Copy / Open platform.",
    fallback_actions: ["copy", "open_platform"],
  };
}

export function openPlatformUrl(platform: string): string {
  const map: Record<string, string> = {
    x: "https://x.com/compose/post",
    linkedin: "https://www.linkedin.com/feed/",
    instagram: "https://www.instagram.com/",
  };
  return map[platform] || "https://";
}
