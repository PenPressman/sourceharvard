-- Allow admins to delete any startup
CREATE POLICY "Admins can delete any startup"
ON public.startups FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
