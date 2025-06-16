
-- Let's check what columns exist and fix the database step by step
DO $$ 
BEGIN
    -- Drop the existing trigger first
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Drop the function
    DROP FUNCTION IF EXISTS public.handle_new_user();
    
    -- Drop the type if it exists
    DROP TYPE IF EXISTS public.user_role CASCADE;
    
    -- Recreate the type
    CREATE TYPE public.user_role AS ENUM ('candidate', 'admin');
    
    -- Add the role column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN role public.user_role DEFAULT 'candidate'::public.user_role NOT NULL;
    ELSE
        -- If column exists, just change its type
        ALTER TABLE public.profiles 
        ALTER COLUMN role TYPE public.user_role USING 
        CASE 
            WHEN role::text = 'admin' THEN 'admin'::public.user_role
            ELSE 'candidate'::public.user_role
        END;
    END IF;
    
    -- Recreate the function with explicit schema reference
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = 'public'
    AS $func$
    BEGIN
      INSERT INTO public.profiles (id, email, full_name, role)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
        CASE 
          WHEN NEW.email LIKE '%admin%' THEN 'admin'::public.user_role
          ELSE 'candidate'::public.user_role
        END
      );
      RETURN NEW;
    END;
    $func$;
    
    -- Recreate the trigger
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      
END $$;
