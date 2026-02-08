
-- Allow public (anon) read access to community posts for the landing page
CREATE POLICY "Anyone can view posts"
ON public.community_posts
FOR SELECT
USING (true);
