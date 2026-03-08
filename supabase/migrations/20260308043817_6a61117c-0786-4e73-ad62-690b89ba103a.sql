
-- Fix overly permissive RLS on user_roles: replace the broad "Service role can manage roles" policy
-- with a targeted one that only lets users assign their own role on signup

DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;

-- Users can insert their own role (for signup flow)
CREATE POLICY "Users can insert their own role"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
