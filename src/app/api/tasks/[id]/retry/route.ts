import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runGrowthPipeline } from "@/lib/agents/orchestrator";

export async function POST(
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

  const { data: task } = await supabase
    .from("agent_tasks")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (task.status !== "failed") {
    return NextResponse.json(
      { error: "Only failed tasks can be retried" },
      { status: 400 }
    );
  }

  if (task.retry_count >= task.max_retries) {
    return NextResponse.json({ error: "Max retries exceeded" }, { status: 400 });
  }

  await supabase
    .from("agent_tasks")
    .update({
      retry_count: task.retry_count + 1,
      status: "queued",
      error: null,
    })
    .eq("id", id);

  if (task.task_type === "full_pipeline" || task.agent_type === "growth_orchestrator") {
    const { data: product } = await supabase
      .from("products")
      .select("id, url")
      .eq("id", task.product_id)
      .single();

    if (product?.url) {
      try {
        await runGrowthPipeline({
          productId: product.id,
          userId: user.id,
          productUrl: product.url,
        });
      } catch (e) {
        return NextResponse.json(
          { error: e instanceof Error ? e.message : "Retry failed" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}
