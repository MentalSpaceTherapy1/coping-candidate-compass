
-- First, let's make sure the user_role enum exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('candidate', 'admin');
    END IF;
END $$;

-- Ensure the profiles table exists with the correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- Enable Row Level Security if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recreate the trigger function to handle new users
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

-- Drop and recreate the trigger to ensure it's working
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
