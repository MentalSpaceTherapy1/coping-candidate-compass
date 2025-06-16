
-- First, let's check if the trigger exists but isn't working properly
-- We'll drop and recreate it to ensure it's working correctly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
