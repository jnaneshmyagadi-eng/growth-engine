-- Phase 3: integrations, metrics, autopilot, attribution

CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  account_id TEXT,
  account_name TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  connection_status TEXT NOT NULL DEFAULT 'not_connected'
    CHECK (connection_status IN ('not_connected', 'connected', 'expired', 'error', 'pending')),
  token_meta JSONB DEFAULT '{}'::jsonb,
  last_sync TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, platform, account_id)
);

CREATE INDEX IF NOT EXISTS idx_integrations_user ON public.integrations(user_id);

CREATE TABLE IF NOT EXISTS public.campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_source TEXT NOT NULL DEFAULT 'user_entered'
    CHECK (metric_source IN ('live', 'user_entered', 'imported', 'estimated')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_metrics_product ON public.campaign_metrics(product_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign ON public.campaign_metrics(campaign_id);

CREATE TABLE IF NOT EXISTS public.attribution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  landing_page TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  event_source TEXT NOT NULL DEFAULT 'user_entered'
    CHECK (event_source IN ('live', 'user_entered', 'imported', 'estimated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attribution_product ON public.attribution_events(product_id);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS autopilot_mode TEXT NOT NULL DEFAULT 'assisted'
    CHECK (autopilot_mode IN ('off', 'assisted', 'autopilot'));

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribution_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own integrations"
  ON public.integrations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view metrics of own products"
  ON public.campaign_metrics FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = campaign_metrics.product_id AND p.user_id = auth.uid()));

CREATE POLICY "Users insert metrics for own products"
  ON public.campaign_metrics FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = campaign_metrics.product_id AND p.user_id = auth.uid()));

CREATE POLICY "Users view attribution of own products"
  ON public.attribution_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = attribution_events.product_id AND p.user_id = auth.uid()));

CREATE POLICY "Users insert attribution for own products"
  ON public.attribution_events FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = attribution_events.product_id AND p.user_id = auth.uid()));
