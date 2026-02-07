
-- Add position column for drag-and-drop ordering
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS position integer DEFAULT 0;

-- Add 'archived' to the scholarship_status enum
ALTER TYPE public.scholarship_status ADD VALUE IF NOT EXISTS 'archived';

-- Add is_favorited column for pinning/favorites
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS is_favorited boolean DEFAULT false;

-- Set initial positions based on creation order
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.scholarships
)
UPDATE public.scholarships s
SET position = r.rn
FROM ranked r
WHERE s.id = r.id;

-- Index for efficient position-based ordering
CREATE INDEX IF NOT EXISTS idx_scholarships_user_position ON public.scholarships(user_id, position);
