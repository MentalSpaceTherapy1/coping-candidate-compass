
-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('candidate', 'admin');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  resume_file_path TEXT,
  role user_role NOT NULL DEFAULT 'candidate',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create interview sections enum
CREATE TYPE public.interview_section AS ENUM ('general', 'technical_scenarios', 'technical_exercises', 'culture');

-- Create interview answers table
CREATE TABLE public.interview_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section interview_section NOT NULL,
  question_key TEXT NOT NULL,
  answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, section, question_key)
);

-- Create exercise uploads table
CREATE TABLE public.exercise_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_key TEXT NOT NULL,
  file_path TEXT,
  file_name TEXT,
  file_type TEXT,
  upload_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, exercise_key)
);

-- Create admin notes table
CREATE TABLE public.admin_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section interview_section,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Interview answers RLS policies
CREATE POLICY "Candidates can manage their own answers" 
  ON public.interview_answers 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all answers" 
  ON public.interview_answers 
  FOR SELECT 
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Exercise uploads RLS policies
CREATE POLICY "Candidates can manage their own uploads" 
  ON public.exercise_uploads 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all uploads" 
  ON public.exercise_uploads 
  FOR SELECT 
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Admin notes RLS policies
CREATE POLICY "Admins can manage admin notes" 
  ON public.admin_notes 
  FOR ALL 
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Candidates can view notes about them" 
  ON public.admin_notes 
  FOR SELECT 
  USING (auth.uid() = candidate_id);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('exercise-uploads', 'exercise-uploads', false);

-- Storage policies for resumes bucket
CREATE POLICY "Users can upload their own resume" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own resume" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all resumes" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'resumes' AND public.get_user_role(auth.uid()) = 'admin');

-- Storage policies for exercise uploads bucket
CREATE POLICY "Users can upload their own exercise files" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'exercise-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own exercise files" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'exercise-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all exercise files" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'exercise-uploads' AND public.get_user_role(auth.uid()) = 'admin');

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    CASE 
      WHEN NEW.email LIKE '%admin%' THEN 'admin'::user_role
      ELSE 'candidate'::user_role
    END
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interview_answers_updated_at 
  BEFORE UPDATE ON public.interview_answers 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_notes_updated_at 
  BEFORE UPDATE ON public.admin_notes 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
