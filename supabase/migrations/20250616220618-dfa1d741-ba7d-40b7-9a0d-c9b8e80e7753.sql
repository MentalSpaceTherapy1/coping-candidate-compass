
-- First, let's ensure ALL users in auth.users have corresponding profiles
-- This will create profiles for any users that don't already have them
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data ->> 'full_name', au.email) as full_name,
    CASE 
        WHEN au.email LIKE '%admin%' THEN 'admin'::user_role
        ELSE 'candidate'::user_role
    END as role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Now let's make sure the trigger function is working properly
-- Drop and recreate the trigger to ensure it works for future signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Insert into profiles, but handle the case where it might already exist
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
        CASE 
            WHEN NEW.email LIKE '%admin%' THEN 'admin'::public.user_role
            ELSE 'candidate'::public.user_role
        END
    )
    ON CONFLICT (id) DO NOTHING; -- Don't fail if profile already exists
    
    RETURN NEW;
EXCEPTION WHEN others THEN
    -- Log the error but don't prevent user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();
