
-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE public.app_role AS ENUM ('founder', 'investor', 'student', 'applicant', 'admin');
CREATE TYPE public.investor_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.business_model_type AS ENUM ('B2B', 'B2C', 'B2B2C', 'Marketplace', 'Other');

-- Add new industry value
ALTER TYPE public.industry_type ADD VALUE IF NOT EXISTS 'Deep Tech';

-- =============================================
-- USER ROLES TABLE (security-definer pattern)
-- =============================================

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can insert roles (we'll use service role for initial assignment)
CREATE POLICY "Service role can manage roles"
  ON public.user_roles FOR ALL
  USING (true)
  WITH CHECK (true);

-- Security definer function to get a user's role without RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- =============================================
-- BASE PROFILES TABLE
-- =============================================

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FOUNDER PROFILES TABLE
-- =============================================

CREATE TABLE public.founder_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  harvard_school TEXT NOT NULL,
  graduation_year INTEGER,
  concentration TEXT,
  role_at_startup TEXT,
  bio TEXT,
  previously_founded BOOLEAN NOT NULL DEFAULT false,
  previous_founding_description TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founder profiles viewable by logged-in users"
  ON public.founder_profiles FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Founders can insert their own profile"
  ON public.founder_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Founders can update their own profile"
  ON public.founder_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_founder_profiles_updated_at
  BEFORE UPDATE ON public.founder_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INVESTOR PROFILES TABLE
-- =============================================

CREATE TABLE public.investor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  firm_name TEXT NOT NULL,
  title TEXT NOT NULL,
  investment_thesis TEXT,
  industries_focus TEXT[] NOT NULL DEFAULT '{}',
  stage_focus TEXT[] NOT NULL DEFAULT '{}',
  check_size_range TEXT,
  portfolio_companies TEXT,
  linkedin_url TEXT,
  status investor_status NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;

-- Investors can view their own profile; founders/admins can see approved ones
CREATE POLICY "Investors view own profile"
  ON public.investor_profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Approved investors visible to founders and students"
  ON public.investor_profiles FOR SELECT
  USING (
    status = 'approved' AND (
      public.has_role(auth.uid(), 'founder') OR
      public.has_role(auth.uid(), 'student') OR
      public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Investors can insert their own profile"
  ON public.investor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Investors can update their own profile"
  ON public.investor_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update investor profiles"
  ON public.investor_profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_investor_profiles_updated_at
  BEFORE UPDATE ON public.investor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- STUDENT PROFILES TABLE
-- =============================================

CREATE TABLE public.student_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  harvard_school TEXT NOT NULL,
  graduation_year INTEGER,
  concentration TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  looking_for TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  github_url TEXT,
  open_to_cofounding BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student profiles viewable by logged-in users"
  ON public.student_profiles FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Students can insert their own profile"
  ON public.student_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own profile"
  ON public.student_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- EXPAND STARTUPS TABLE
-- =============================================

ALTER TABLE public.startups
  ADD COLUMN full_description TEXT,
  ADD COLUMN logo_url TEXT,
  ADD COLUMN tech_stack TEXT,
  ADD COLUMN business_model business_model_type,
  ADD COLUMN target_market TEXT,
  ADD COLUMN traction TEXT,
  ADD COLUMN funding_raised TEXT,
  ADD COLUMN pitch_deck_url TEXT,
  ADD COLUMN looking_for_cofounder BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN twitter_url TEXT,
  ADD COLUMN linkedin_url TEXT;

-- =============================================
-- TRIGGER: auto-create profile on signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
