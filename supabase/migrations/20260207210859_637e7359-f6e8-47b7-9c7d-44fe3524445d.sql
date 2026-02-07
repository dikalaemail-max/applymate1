-- Drop the policy we just created - we'll use a function instead
DROP POLICY IF EXISTS "Access shared scholarships by token" ON public.scholarships;

-- Create a secure function to look up shared scholarships by token
CREATE OR REPLACE FUNCTION public.get_shared_scholarship(_token uuid)
RETURNS TABLE (
  id uuid,
  name text,
  organization text,
  amount numeric,
  deadline timestamptz,
  link text,
  status scholarship_status,
  eligibility_notes text,
  tags text[],
  notes text,
  is_shared boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.name, s.organization, s.amount, s.deadline, s.link, s.status,
         s.eligibility_notes, s.tags, s.notes, s.is_shared, s.created_at, s.updated_at
  FROM public.scholarships s
  WHERE s.share_token = _token AND s.is_shared = true
  LIMIT 1;
$$;