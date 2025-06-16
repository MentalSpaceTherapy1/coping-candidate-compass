
-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update interview_answers table to support all answer types
ALTER TABLE public.interview_answers 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add triggers for updated_at timestamps
DROP TRIGGER IF EXISTS update_interview_answers_updated_at ON public.interview_answers;
CREATE TRIGGER update_interview_answers_updated_at
    BEFORE UPDATE ON public.interview_answers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_exercise_uploads_updated_at ON public.exercise_uploads;
ALTER TABLE public.exercise_uploads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
CREATE TRIGGER update_exercise_uploads_updated_at
    BEFORE UPDATE ON public.exercise_uploads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create RLS policies for interview_answers
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;

-- Users can only access their own interview answers
CREATE POLICY "Users can view own interview answers" ON public.interview_answers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interview answers" ON public.interview_answers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interview answers" ON public.interview_answers
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all interview answers
CREATE POLICY "Admins can view all interview answers" ON public.interview_answers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create RLS policies for exercise_uploads
ALTER TABLE public.exercise_uploads ENABLE ROW LEVEL SECURITY;

-- Users can only access their own uploads
CREATE POLICY "Users can view own exercise uploads" ON public.exercise_uploads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise uploads" ON public.exercise_uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise uploads" ON public.exercise_uploads
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all uploads
CREATE POLICY "Admins can view all exercise uploads" ON public.exercise_uploads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create interview_progress table to track completion status
CREATE TABLE IF NOT EXISTS public.interview_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_step INTEGER DEFAULT 1,
    completed_sections JSONB DEFAULT '{}',
    submission_status TEXT DEFAULT 'draft' CHECK (submission_status IN ('draft', 'in-progress', 'completed')),
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Add RLS for interview_progress
ALTER TABLE public.interview_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interview progress" ON public.interview_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own interview progress" ON public.interview_progress
    FOR ALL USING (auth.uid() = user_id);

-- Admins can view all progress
CREATE POLICY "Admins can view all interview progress" ON public.interview_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Add trigger for interview_progress updated_at
DROP TRIGGER IF EXISTS update_interview_progress_updated_at ON public.interview_progress;
CREATE TRIGGER update_interview_progress_updated_at
    BEFORE UPDATE ON public.interview_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
