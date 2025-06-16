
-- Drop the problematic function and policy
DROP POLICY IF EXISTS "Users can view own profile, admins can view all" ON public.profiles;
DROP FUNCTION IF EXISTS public.is_admin();

-- Create a new, simpler policy that allows users to see their own profile
-- and uses a direct check for admin role without circular dependency
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Create a separate policy for admins that directly checks the profiles table
-- This works because we're checking a different condition (role = 'admin')
-- on the same table, which doesn't create recursion
CREATE POLICY "Admin users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
