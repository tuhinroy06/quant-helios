-- Fix overly permissive RLS policy for organizations INSERT
-- Replace the WITH CHECK (true) with proper user authentication check

DROP POLICY IF EXISTS "Users can create orgs" ON public.organizations;

CREATE POLICY "Authenticated users can create orgs"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);