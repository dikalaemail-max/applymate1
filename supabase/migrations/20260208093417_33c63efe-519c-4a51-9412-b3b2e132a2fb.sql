-- 1. Drop the overly permissive public policy that exposes user emails
DROP POLICY IF EXISTS "Anyone can view posts" ON public.community_posts;

-- 2. Create a secure RPC for landing page community preview (no emails exposed)
CREATE OR REPLACE FUNCTION public.get_recent_public_posts()
RETURNS TABLE (
  id uuid,
  content text,
  created_at timestamptz,
  display_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cp.id, cp.content, cp.created_at,
         COALESCE(p.display_name, split_part(cp.user_email, '@', 1)) as display_name
  FROM public.community_posts cp
  LEFT JOIN public.profiles p ON p.user_id = cp.user_id
  ORDER BY cp.created_at DESC
  LIMIT 5;
$$;

-- 3. Secure the public_shared_scholarships view by recreating with security_invoker
DROP VIEW IF EXISTS public.public_shared_scholarships;
CREATE VIEW public.public_shared_scholarships
WITH (security_invoker = on) AS
  SELECT id, name, organization, amount, deadline, link, status,
         eligibility_notes, tags, notes, is_shared, created_at, updated_at
  FROM public.scholarships
  WHERE is_shared = true;