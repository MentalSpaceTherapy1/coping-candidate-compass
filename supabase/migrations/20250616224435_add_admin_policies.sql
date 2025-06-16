
-- Create a security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add admin policy that can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
      auth.uid() = id OR public.is_current_user_admin()
    );

-- Add admin policy for updates (admins can update any profile)
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
      auth.uid() = id OR public.is_current_user_admin()
    );
