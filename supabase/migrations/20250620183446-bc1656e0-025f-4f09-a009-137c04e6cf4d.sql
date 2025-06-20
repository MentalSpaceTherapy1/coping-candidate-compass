
-- Add candidate_email column to interview_answers table
ALTER TABLE public.interview_answers 
ADD COLUMN candidate_email text;

-- Add candidate_email column to interview_progress table  
ALTER TABLE public.interview_progress 
ADD COLUMN candidate_email text;

-- Add unique constraints to prevent duplicate entries
ALTER TABLE public.interview_answers 
ADD CONSTRAINT interview_answers_candidate_email_question_section_unique 
UNIQUE (candidate_email, question_key, section);

ALTER TABLE public.interview_progress 
ADD CONSTRAINT interview_progress_candidate_email_unique 
UNIQUE (candidate_email);

-- Update existing constraint names to be more descriptive
ALTER TABLE public.interview_answers 
DROP CONSTRAINT IF EXISTS interview_answers_user_id_question_key_section_key;

ALTER TABLE public.interview_answers 
ADD CONSTRAINT interview_answers_user_id_question_section_unique 
UNIQUE (user_id, question_key, section);
