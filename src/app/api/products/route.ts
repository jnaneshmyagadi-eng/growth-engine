import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidUrl, normalizeProductUrl } from "@/lib/utils";
import { runGrowthPipeline } from "@/lib/agents/orchestrator";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const rawUrl = (body.url as string)?.trim();
    const description = (body.description as string)?.trim() || null;

    if (!rawUrl && !description) {
      return NextResponse.json(
        { error: "Provide a product URL or description" },
        { status: 400 }
      );
    }

    let url: string | null = null;
    if (rawUrl) {
      url = normalizeProductUrl(rawUrl);
      if (!isValidUrl(url)) {
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
      }
    }

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0],
      },
      { onConflict: "id" }
    );

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        user_id: user.id,
        url,
        description,
        status: "pending",
      })
      .select("id, url, status")
      .single();

    if (error || !product) {
      return NextResponse.json(
        { error: error?.message || "Failed to create product" },
        { status: 500 }
      );
    }

    await supabase.from("analytics_events").insert({
      product_id: product.id,
      user_id: user.id,
      event_name: "product_created",
      properties: { url },
    });

    if (url) {
      try {
        await runGrowthPipeline({
          productId: product.id,
          userId: user.id,
          productUrl: url,
        });
      } catch (pipelineErr) {
        console.error("Pipeline error:", pipelineErr);
      }
    }

    return NextResponse.json({
      id: product.id,
      status: "analyzing",
      message: "Growth engine started",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, name, url, status, growth_score, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ products: data });
}
