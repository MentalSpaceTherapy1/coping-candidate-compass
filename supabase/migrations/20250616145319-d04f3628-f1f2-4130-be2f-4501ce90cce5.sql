
-- Update the user role to admin for ejoseph@chctherapy.com
UPDATE public.profiles 
SET role = 'admin'::public.user_role 
WHERE email = 'ejoseph@chctherapy.com';
