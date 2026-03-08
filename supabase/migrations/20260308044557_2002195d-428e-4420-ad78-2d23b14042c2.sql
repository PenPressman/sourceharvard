
-- Endorsements table
CREATE TABLE public.endorsements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('startup', 'founder', 'student')),
  target_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view endorsements"
  ON public.endorsements FOR SELECT USING (true);

CREATE POLICY "Authenticated users can endorse"
  ON public.endorsements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own endorsements"
  ON public.endorsements FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for fast count queries
CREATE INDEX idx_endorsements_target ON public.endorsements(target_type, target_id);
CREATE INDEX idx_endorsements_user ON public.endorsements(user_id);
CREATE INDEX idx_endorsements_created ON public.endorsements(created_at);

-- RPC: counts for a single target (total + investor-only)
CREATE OR REPLACE FUNCTION public.get_endorsement_counts(p_target_type TEXT, p_target_id UUID)
RETURNS TABLE(total BIGINT, investor_count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    COUNT(*) AS total,
    COUNT(CASE WHEN ip.status = 'approved' THEN 1 END) AS investor_count
  FROM endorsements e
  LEFT JOIN investor_profiles ip ON ip.user_id = e.user_id
  WHERE e.target_type = p_target_type AND e.target_id = p_target_id;
$$;

-- RPC: counts for all startups (for browse page merging)
CREATE OR REPLACE FUNCTION public.get_all_startup_endorsements()
RETURNS TABLE(startup_id UUID, total BIGINT, investor_count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    e.target_id AS startup_id,
    COUNT(*) AS total,
    COUNT(CASE WHEN ip.status = 'approved' THEN 1 END) AS investor_count
  FROM endorsements e
  LEFT JOIN investor_profiles ip ON ip.user_id = e.user_id
  WHERE e.target_type = 'startup'
  GROUP BY e.target_id;
$$;

-- RPC: trending (most endorsements in last 7 days per startup)
CREATE OR REPLACE FUNCTION public.get_trending_startup_ids()
RETURNS TABLE(startup_id UUID, recent_count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    e.target_id AS startup_id,
    COUNT(*) AS recent_count
  FROM endorsements e
  WHERE e.target_type = 'startup'
    AND e.created_at >= now() - interval '7 days'
  GROUP BY e.target_id
  ORDER BY recent_count DESC;
$$;
