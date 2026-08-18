/**
 * Growth Orchestrator — Product Intelligence core loop
 * Fetches product URL → analyzes → stores analysis → basic audience/strategy
 */
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config";
import { fetchAndExtractProduct } from "@/lib/research/fetch-product";
import { analyzeProductPage } from "@/lib/agents/product-researcher";

function getServiceClient() {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || SUPABASE_ANON_KEY;
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type PipelineInput = {
  productId: string;
  userId: string;
  productUrl: string;
};

export async function runGrowthPipeline(params: PipelineInput): Promise<void> {
  const { productId, userId, productUrl } = params;
  const supabase = getServiceClient();

  const { data: orchTask } = await supabase
    .from("agent_tasks")
    .insert({
      product_id: productId,
      user_id: userId,
      agent_type: "growth_orchestrator",
      task_type: "full_pipeline",
      status: "running",
      priority: 100,
      input: { productUrl },
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  const orchId = orchTask?.id;

  try {
    await supabase.from("products").update({ status: "analyzing" }).eq("id", productId);

    // 1. Fetch + extract
    const { data: researchTask } = await supabase
      .from("agent_tasks")
      .insert({
        product_id: productId,
        user_id: userId,
        agent_type: "product_researcher",
        task_type: "analyze_product",
        status: "running",
        priority: 90,
        input: { productUrl },
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    let page;
    try {
      page = await fetchAndExtractProduct(productUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Fetch failed";
      if (researchTask?.id) {
        await supabase
          .from("agent_tasks")
          .update({ status: "failed", error: msg, completed_at: new Date().toISOString() })
          .eq("id", researchTask.id);
      }
      await supabase.from("products").update({ status: "failed" }).eq("id", productId);
      throw err;
    }

    const profile = analyzeProductPage(page);

    // Store analysis
    await supabase.from("product_analyses").upsert(
      {
        product_id: productId,
        what_it_is: profile.what_it_is,
        problem_solved: profile.problem_solved,
        target_users: profile.target_users,
        main_benefits: profile.main_benefits,
        differentiators: profile.differentiators,
        possible_objections: profile.possible_objections,
        positioning: profile.positioning,
        conversion_goal: profile.conversion_goal,
        confidence: profile.confidence,
        claim_type: profile.claim_type,
        reasoning_summary: profile.reasoning_summary,
        source_data: {
          title: profile.homepage_title,
          meta: profile.homepage_meta_description,
          pricing: profile.pricing_observed,
          features: profile.features_observed,
          ctas: profile.ctas_observed,
          social: profile.social_links,
          source_url: profile.source_url,
          claim_types: {
            observed: "SOURCE_DATA",
            inferred: "AI_INFERENCE",
          },
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "product_id" }
    );

    // Update product name from title
    const name =
      profile.homepage_title?.slice(0, 120) ||
      new URL(productUrl).hostname;
    await supabase
      .from("products")
      .update({
        name,
        description: profile.what_it_is.slice(0, 500),
        status: "ready",
        growth_score: Math.round(profile.confidence * 100),
      })
      .eq("id", productId);

    if (researchTask?.id) {
      await supabase
        .from("agent_tasks")
        .update({
          status: "completed",
          output: { confidence: profile.confidence },
          completed_at: new Date().toISOString(),
        })
        .eq("id", researchTask.id);
    }

    // 2. Basic audience from target users
    await supabase.from("audiences").delete().eq("product_id", productId);
    for (const [i, user] of profile.target_users.slice(0, 5).entries()) {
      await supabase.from("audiences").insert({
        product_id: productId,
        name: user,
        description: `Inferred audience from homepage signals: ${user}`,
        pain_points: profile.possible_objections.slice(0, 3),
        channels: ["organic_search", "content", "social"],
        priority: 10 - i,
        confidence: profile.confidence,
        claim_type: "ai_inference",
      });
    }

    // 3. Strategy stub from positioning
    await supabase.from("strategies").delete().eq("product_id", productId);
    await supabase.from("strategies").insert({
      product_id: productId,
      name: "Homepage-derived growth strategy",
      summary: profile.positioning,
      channels: ["organic_search", "content", "linkedin", "x"],
      hypotheses: [
        `Users searching for solutions related to: ${profile.problem_solved.slice(0, 100)}`,
        `Primary CTA goal: ${profile.conversion_goal}`,
      ],
      confidence: profile.confidence,
      claim_type: "ai_inference",
      evidence: profile.reasoning_summary,
    });

    // 4. Recommendation
    await supabase.from("growth_recommendations").delete().eq("product_id", productId);
    await supabase.from("growth_recommendations").insert({
      product_id: productId,
      title: "Validate primary CTA and pricing visibility",
      description: profile.possible_objections[0] || "Run a landing-page experiment on primary CTA copy.",
      channel: "landing_page",
      priority: "high",
      status: "pending",
      claim_type: "ai_recommendation",
      evidence: profile.reasoning_summary,
    });

    if (orchId) {
      await supabase
        .from("agent_tasks")
        .update({
          status: "completed",
          output: { name, confidence: profile.confidence },
          completed_at: new Date().toISOString(),
        })
        .eq("id", orchId);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Pipeline failed";
    if (orchId) {
      await supabase
        .from("agent_tasks")
        .update({
          status: "failed",
          error: msg,
          completed_at: new Date().toISOString(),
        })
        .eq("id", orchId);
    }
    await supabase.from("products").update({ status: "failed" }).eq("id", productId);
    throw err;
  }
}
