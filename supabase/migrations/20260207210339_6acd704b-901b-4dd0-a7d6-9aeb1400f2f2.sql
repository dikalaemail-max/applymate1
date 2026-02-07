-- Create a public view for shared scholarships that excludes share_token and user_id
CREATE VIEW public.public_shared_scholarships
WITH (security_invoker = on) AS
SELECT id, name, organization, amount, deadline, link, status,
       eligibility_notes, tags, notes, is_shared, created_at, updated_at
FROM public.scholarships
WHERE is_shared = true;

-- Grant access to the view
GRANT SELECT ON public.public_shared_scholarships TO anon, authenticated;

-- Drop the overly permissive public policy that exposes share_token
DROP POLICY IF EXISTS "Public shared scholarships" ON public.scholarships;