-- Add application type column to scholarships table
ALTER TABLE public.scholarships
ADD COLUMN application_type TEXT NOT NULL DEFAULT 'scholarship'
CHECK (application_type IN ('scholarship', 'job'));

-- Create index for filtering by type
CREATE INDEX idx_scholarships_application_type ON public.scholarships(application_type);