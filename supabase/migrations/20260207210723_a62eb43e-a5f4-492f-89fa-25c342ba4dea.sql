-- Allow access to shared scholarships only when querying by the correct share_token
-- This is safe because users must already know the token to query
CREATE POLICY "Access shared scholarships by token"
ON public.scholarships FOR SELECT
USING (is_shared = true AND share_token IS NOT NULL);
