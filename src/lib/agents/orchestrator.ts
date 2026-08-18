/** Growth pipeline orchestrator — full implementation in local main; production stub until full tree sync. */
export type PipelineInput = {
  productId: string;
  userId: string;
  productUrl: string;
};

export async function runGrowthPipeline(_input: PipelineInput): Promise<void> {
  // Full agent pipeline requires complete local source on GitHub.
  // No-op on partial deploys so the app builds and homepage stays live.
  console.info("[manthik] runGrowthPipeline stub — full agents not yet on this branch");
}
