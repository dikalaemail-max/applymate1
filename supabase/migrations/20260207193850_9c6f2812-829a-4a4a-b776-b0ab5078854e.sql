
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Scholarship status enum
CREATE TYPE public.scholarship_status AS ENUM ('saved', 'in_progress', 'submitted', 'awarded', 'rejected');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Scholarships table
CREATE TABLE public.scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  organization TEXT,
  amount NUMERIC,
  deadline TIMESTAMPTZ,
  link TEXT,
  status scholarship_status NOT NULL DEFAULT 'saved',
  eligibility_notes TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  share_token UUID UNIQUE DEFAULT gen_random_uuid(),
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scholarships" ON public.scholarships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scholarships" ON public.scholarships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scholarships" ON public.scholarships FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scholarships" ON public.scholarships FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public shared scholarships" ON public.scholarships FOR SELECT USING (is_shared = true);
CREATE POLICY "Admins can view all scholarships" ON public.scholarships FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Shared scholarships (email invites)
CREATE TABLE public.shared_scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id UUID REFERENCES public.scholarships(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scholarships shared with them" ON public.shared_scholarships FOR SELECT USING (auth.uid() = shared_with);
CREATE POLICY "Users can share their own scholarships" ON public.shared_scholarships FOR INSERT WITH CHECK (auth.uid() = shared_by);
CREATE POLICY "Users can view their own shares" ON public.shared_scholarships FOR SELECT USING (auth.uid() = shared_by);
CREATE POLICY "Users can delete their own shares" ON public.shared_scholarships FOR DELETE USING (auth.uid() = shared_by);

-- Allow users to view scholarships shared with them
CREATE POLICY "Users can view scholarships shared to them" ON public.scholarships FOR SELECT 
USING (id IN (SELECT scholarship_id FROM public.shared_scholarships WHERE shared_with = auth.uid()));

-- Scholarship files metadata
CREATE TABLE public.scholarship_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_id UUID REFERENCES public.scholarships(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scholarship_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files" ON public.scholarship_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own files" ON public.scholarship_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own files" ON public.scholarship_files FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for scholarship documents
INSERT INTO storage.buckets (id, name, public) VALUES ('scholarship-files', 'scholarship-files', false);

CREATE POLICY "Users can upload own files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'scholarship-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own files" ON storage.objects FOR SELECT USING (bucket_id = 'scholarship-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (bucket_id = 'scholarship-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_scholarships_updated_at BEFORE UPDATE ON public.scholarships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  -- Default role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
