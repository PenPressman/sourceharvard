
-- Add contact info + visibility fields to startups
ALTER TABLE public.startups
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_visible_to_vcs BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contact_visible_to_founders BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contact_visible_to_public BOOLEAN NOT NULL DEFAULT false;

-- Create saved_startups table for VC bookmarks
CREATE TABLE IF NOT EXISTS public.saved_startups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, startup_id)
);

ALTER TABLE public.saved_startups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "VCs can view their own saved startups"
  ON public.saved_startups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "VCs can save startups"
  ON public.saved_startups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "VCs can unsave startups"
  ON public.saved_startups FOR DELETE
  USING (auth.uid() = user_id);
