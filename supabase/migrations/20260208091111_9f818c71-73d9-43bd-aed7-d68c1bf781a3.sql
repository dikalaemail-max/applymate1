
-- Table to cache AI results (advisor, success meter) per user/scholarship
CREATE TABLE public.ai_results_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scholarship_id UUID,
  result_type TEXT NOT NULL, -- 'advisor', 'success_meter', 'essay_history'
  result_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, scholarship_id, result_type)
);

-- Enable RLS
ALTER TABLE public.ai_results_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI results"
ON public.ai_results_cache FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI results"
ON public.ai_results_cache FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI results"
ON public.ai_results_cache FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI results"
ON public.ai_results_cache FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_ai_results_cache_updated_at
BEFORE UPDATE ON public.ai_results_cache
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
