import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [analysis, audiences, strategies, recommendations, tasks] =
    await Promise.all([
      supabase.from("product_analyses").select("*").eq("product_id", id).maybeSingle(),
      supabase.from("audiences").select("*").eq("product_id", id).order("priority", { ascending: false }),
      supabase.from("strategies").select("*").eq("product_id", id),
      supabase.from("growth_recommendations").select("*").eq("product_id", id),
      supabase.from("agent_tasks").select("*").eq("product_id", id).order("created_at", { ascending: false }).limit(20),
    ]);

  return NextResponse.json({
    product,
    analysis: analysis.data,
    audiences: audiences.data || [],
    strategies: strategies.data || [],
    recommendations: recommendations.data || [],
    tasks: tasks.data || [],
  });
}
