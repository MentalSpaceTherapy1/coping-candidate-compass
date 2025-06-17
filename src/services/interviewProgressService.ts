
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type InterviewProgress = Database['public']['Tables']['interview_progress']['Row'];

export class InterviewProgressService {
  static async loadProgress(userId: string): Promise<{ data: InterviewProgress | null; error: any }> {
    console.log('📈 Loading progress for user:', userId);
    
    const { data, error } = await supabase
      .from('interview_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data, error };
  }

  static async updateProgress(
    userId: string,
    step: number,
    completedSections?: any
  ): Promise<{ data: InterviewProgress | null; error: any }> {
    console.log('📈 Updating progress:', { userId, step, completedSections });

    const progressData = {
      user_id: userId,
      current_step: step,
      completed_sections: completedSections || {},
      submission_status: (step === 5 && completedSections ? 'completed' : 'in-progress') as Database['public']['Tables']['interview_progress']['Row']['submission_status'],
      submitted_at: step === 5 && completedSections ? new Date().toISOString() : null
    };

    console.log('📤 Saving progress data:', progressData);

    const { data, error } = await supabase
      .from('interview_progress')
      .upsert(progressData, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    return { data, error };
  }
}
