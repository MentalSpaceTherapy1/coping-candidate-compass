
-- Add foreign key constraint to link interview_progress to profiles
ALTER TABLE public.interview_progress 
ADD CONSTRAINT fk_interview_progress_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update any existing interview_progress records that might not have corresponding profiles
-- This ensures data integrity before we establish the relationship
DELETE FROM public.interview_progress 
WHERE user_id NOT IN (SELECT id FROM public.profiles);
