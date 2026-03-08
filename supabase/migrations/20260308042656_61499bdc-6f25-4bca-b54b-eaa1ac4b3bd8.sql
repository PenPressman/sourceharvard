
-- Create enum types
CREATE TYPE public.industry_type AS ENUM ('Fintech', 'Biotech', 'AI/ML', 'Consumer', 'B2B SaaS', 'Hardware', 'Social Impact', 'Other');
CREATE TYPE public.stage_type AS ENUM ('Idea', 'Pre-seed', 'Seed', 'Series A+');
CREATE TYPE public.compensation_type AS ENUM ('Paid', 'Equity', 'Unpaid');

-- Create startups table
CREATE TABLE public.startups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  industry industry_type NOT NULL,
  stage stage_type NOT NULL,
  founded_year INTEGER NOT NULL,
  team_size INTEGER NOT NULL DEFAULT 1,
  website_url TEXT,
  is_hiring BOOLEAN NOT NULL DEFAULT false,
  open_to_vc BOOLEAN NOT NULL DEFAULT false,
  harvard_affiliation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create open_roles table
CREATE TABLE public.open_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  compensation compensation_type NOT NULL,
  hours_per_week INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_roles ENABLE ROW LEVEL SECURITY;

-- Startups: anyone can view
CREATE POLICY "Anyone can view startups"
  ON public.startups FOR SELECT
  USING (true);

-- Startups: only authenticated users with verified harvard email can insert
CREATE POLICY "Verified users can create startups"
  ON public.startups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Startups: only owner can update
CREATE POLICY "Owners can update their startups"
  ON public.startups FOR UPDATE
  USING (auth.uid() = user_id);

-- Startups: only owner can delete
CREATE POLICY "Owners can delete their startups"
  ON public.startups FOR DELETE
  USING (auth.uid() = user_id);

-- Open roles: anyone can view
CREATE POLICY "Anyone can view open roles"
  ON public.open_roles FOR SELECT
  USING (true);

-- Open roles: startup owner can insert roles
CREATE POLICY "Startup owners can insert roles"
  ON public.open_roles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.startups
      WHERE id = startup_id AND user_id = auth.uid()
    )
  );

-- Open roles: startup owner can update roles
CREATE POLICY "Startup owners can update roles"
  ON public.open_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.startups
      WHERE id = startup_id AND user_id = auth.uid()
    )
  );

-- Open roles: startup owner can delete roles
CREATE POLICY "Startup owners can delete roles"
  ON public.open_roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.startups
      WHERE id = startup_id AND user_id = auth.uid()
    )
  );

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_startups_updated_at
  BEFORE UPDATE ON public.startups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
