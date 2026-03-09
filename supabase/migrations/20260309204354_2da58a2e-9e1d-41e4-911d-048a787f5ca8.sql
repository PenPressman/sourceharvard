
-- Add new industry types
ALTER TYPE public.industry_type ADD VALUE IF NOT EXISTS 'HealthTech';
ALTER TYPE public.industry_type ADD VALUE IF NOT EXISTS 'EdTech';
ALTER TYPE public.industry_type ADD VALUE IF NOT EXISTS 'Climate Tech';
ALTER TYPE public.industry_type ADD VALUE IF NOT EXISTS 'Web3/Crypto';
ALTER TYPE public.industry_type ADD VALUE IF NOT EXISTS 'Robotics';
ALTER TYPE public.industry_type ADD VALUE IF NOT EXISTS 'Media/Content';
ALTER TYPE public.industry_type ADD VALUE IF NOT EXISTS 'Legal Tech';
ALTER TYPE public.industry_type ADD VALUE IF NOT EXISTS 'Real Estate';
ALTER TYPE public.industry_type ADD VALUE IF NOT EXISTS 'GovTech';
ALTER TYPE public.industry_type ADD VALUE IF NOT EXISTS 'FoodTech';

-- Add new stage types
ALTER TYPE public.stage_type ADD VALUE IF NOT EXISTS 'Bootstrapped';
ALTER TYPE public.stage_type ADD VALUE IF NOT EXISTS 'Series B+';
ALTER TYPE public.stage_type ADD VALUE IF NOT EXISTS 'Revenue Stage';
