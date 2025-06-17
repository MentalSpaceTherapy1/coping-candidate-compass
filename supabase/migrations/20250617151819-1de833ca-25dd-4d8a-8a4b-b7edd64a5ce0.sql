
-- First, let's see what's in the profiles table
SELECT id, email, full_name, role, created_at 
FROM public.profiles 
ORDER BY created_at DESC;

-- Check if there's a profile for the user with interview progress
SELECT p.id, p.email, p.full_name, p.role, p.created_at,
       ip.user_id as progress_user_id, ip.submission_status
FROM public.profiles p
RIGHT JOIN public.interview_progress ip ON p.id = ip.user_id
WHERE ip.user_id = '4dca88ee-0417-4a0d-bbb6-36d9cee16116';

-- If the profile doesn't exist, let's check the auth.users table to see if the user exists there
-- (This is just for debugging - we can't normally access auth.users from the public schema)

-- Let's try to create a profile for Steven Williams if it doesn't exist
-- We'll need to use a different approach since we can't directly access auth.users
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  '4dca88ee-0417-4a0d-bbb6-36d9cee16116',
  'steven.williams@example.com',
  'Steven Williams', 
  'candidate'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'candidate',
  full_name = COALESCE(profiles.full_name, 'Steven Williams'),
  email = COALESCE(profiles.email, 'steven.williams@example.com');
