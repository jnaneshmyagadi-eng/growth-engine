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
    await supabase
      .from("products")
      .update({ status: "analyzing" })
      .eq("id", productId);

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
          .update({
            status: "failed",
            error: msg,
            completed_at: new Date().toISOString(),
          })
          .eq("id", researchTask.id);
      }
      await supabase
        .from("products")
        .update({ status: "failed" })
        .eq("id", productId);
      throw err;
    }

    const profile = analyzeProductPage(page);

    await supabase.from("product_analyses").delete().eq("product_id", productId);
    await supabase.from("product_analyses").insert({
      product_id: productId,
      homepage_title: profile.homepage_title,
      homepage_meta_description: profile.homepage_meta_description,
      pricing_observed: profile.pricing_observed,
      features_observed: profile.features_observed,
      ctas_observed: profile.ctas_observed,
      social_links: profile.social_links,
      what_it_is: profile.what_it_is,
      problem_solved: profile.problem_solved,
      target_users: profile.target_users,
      main_benefits: profile.main_benefits,
      differentiators: profile.differentiators,
      possible_objections: profile.possible_objections,
      positioning: profile.positioning,
      conversion_goal: profile.conversion_goal,
      confidence: profile.confidence,
      extracted_text: page.text.slice(0, 10000),
      raw_html_excerpt: page.htmlExcerpt.slice(0, 5000),
      analysis_status: "completed",
      completed_at: new Date().toISOString(),
    });

    const name =
      profile.homepage_title?.slice(0, 120) || new URL(productUrl).hostname;

    await supabase
      .from("products")
      .update({
        name,
        description: profile.what_it_is.slice(0, 500),
        status: "analyzed",
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

    await supabase.from("audiences").delete().eq("product_id", productId);
    for (const [i, user] of profile.target_users.slice(0, 5).entries()) {
      await supabase.from("audiences").insert({
        product_id: productId,
        name: user,
        description: `Inferred audience from homepage signals: ${user}`,
        pain_points: profile.possible_objections.slice(0, 3),
        channels: ["organic_search", "content", "social"],
        rank: 10 - i,
        confidence: profile.confidence,
        claim_type: "ai_inference",
      });
    }

    await supabase.from("strategies").delete().eq("product_id", productId);
    await supabase.from("strategies").insert({
      product_id: productId,
      positioning: profile.positioning,
      value_proposition: profile.what_it_is.slice(0, 500),
      acquisition_channels: [
        "organic_search",
        "content",
        "linkedin",
        "x",
      ],
      organic_strategy: profile.reasoning_summary,
      explain_why: {
        summary: profile.reasoning_summary,
        claim_type: "ai_inference",
        confidence: profile.confidence,
      },
      confidence: profile.confidence,
      status: "draft",
    });

    await supabase
      .from("growth_recommendations")
      .delete()
      .eq("product_id", productId);
    await supabase.from("growth_recommendations").insert({
      product_id: productId,
      title: "Validate primary CTA and pricing visibility",
      body:
        profile.possible_objections[0] ||
        "Run a landing-page experiment on primary CTA copy.",
      category: "conversion",
      priority: 90,
      status: "active",
      explain_why: {
        evidence: profile.reasoning_summary,
        claim_type: "ai_recommendation",
      },
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
    await supabase
      .from("products")
      .update({ status: "failed" })
      .eq("id", productId);
    throw err;
  }
}
