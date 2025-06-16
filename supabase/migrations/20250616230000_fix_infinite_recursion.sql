
-- Drop the problematic admin function that causes recursion
DROP FUNCTION IF EXISTS public.is_current_user_admin();

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can do everything" ON public.profiles;

-- Create a simple, non-recursive function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text AS $$
BEGIN
  -- Use a direct query without referencing the profiles table in a way that causes recursion
  RETURN (SELECT role::text FROM public.profiles WHERE id = user_id LIMIT 1);
EXCEPTION WHEN OTHERS THEN
  RETURN 'candidate';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create simple policies that work
CREATE POLICY "Enable read for own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role full access" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Admin access policy (simplified to avoid recursion)
CREATE POLICY "Admin users can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

CREATE POLICY "Admin users can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );
