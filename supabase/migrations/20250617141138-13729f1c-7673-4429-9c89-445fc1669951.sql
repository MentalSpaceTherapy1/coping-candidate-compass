
-- Drop all existing policies to start completely fresh
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
DROP POLICY IF EXISTS "Admin access" ON public.profiles;

-- Create completely simple policies without any recursion
CREATE POLICY "Enable read for users" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for users" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Service role policy (for system operations)
CREATE POLICY "Service role access" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

-- For admin functionality, we'll handle it in the application layer instead of RLS
-- This removes the recursive admin policy that was causing the issue
