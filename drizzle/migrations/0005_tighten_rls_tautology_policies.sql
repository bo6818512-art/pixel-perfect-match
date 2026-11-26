-- 1. support_submissions: remove permissive public insert policy and require server-validated writes
DROP POLICY IF EXISTS "public_support_insert" ON public.support_submissions;
REVOKE INSERT ON public.support_submissions FROM anon, authenticated;
GRANT ALL ON public.support_submissions TO service_role;

-- 2. documents: restrict direct reads to admins
DROP POLICY IF EXISTS "document_read" ON public.documents;
CREATE POLICY "document_admin_read"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3. profile_documents: remove permissive read policy (admins already have requirements_admin)
DROP POLICY IF EXISTS "requirements_read" ON public.profile_documents;

-- 4. requirement_profiles: restrict direct reads to admins
DROP POLICY IF EXISTS "requirement_read" ON public.requirement_profiles;
CREATE POLICY "requirement_admin_read"
  ON public.requirement_profiles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 5. required_plot_documents: keep authenticated per-plot document lookup working safely
CREATE OR REPLACE FUNCTION public.required_plot_documents(p_property uuid, p_category text)
RETURNS TABLE(id integer, name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT d.id, d.name
  FROM public.licensing_plots p
  JOIN public.profile_documents pd ON pd.profile_id = p.profile_id
  JOIN public.documents d ON d.id = pd.document_id
  WHERE auth.uid() IS NOT NULL
    AND p.id = p_property
    AND p.enabled = true
    AND pd.is_required
  ORDER BY d.id;
$$;

REVOKE ALL ON FUNCTION public.required_plot_documents(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.required_plot_documents(uuid, text) TO authenticated, service_role;