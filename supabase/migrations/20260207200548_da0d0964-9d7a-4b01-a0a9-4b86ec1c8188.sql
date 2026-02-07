CREATE TABLE public.application_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id UUID NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.application_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own checklist"
  ON public.application_checklist FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);