import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listIntegrations } from "@/lib/integrations/registry";
import { listResearchProviders } from "@/lib/research/providers/registry";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: connected } = await supabase
    .from("integrations")
    .select("id, platform, account_id, account_name, connection_status, last_sync, last_error")
    .eq("user_id", user.id);

  return NextResponse.json({
    social: listIntegrations(),
    research_providers: listResearchProviders(),
    user_connections: connected || [],
  });
}
