
-- First, let's drop the problematic policy and create a simpler one
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a simpler policy that allows users to view their own profile
-- and uses a security definer function for admin access
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a new policy that allows users to see their own profile
-- and admins to see all profiles
CREATE POLICY "Users can view own profile, admins can view all" 
  ON public.profiles 
  FOR SELECT 
  USING (
    auth.uid() = id OR public.is_admin()
  );
