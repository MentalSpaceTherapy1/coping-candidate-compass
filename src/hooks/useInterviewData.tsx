
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

type InterviewAnswer = Database['public']['Tables']['interview_answers']['Row'];
type InterviewProgress = Database['public']['Tables']['interview_progress']['Row'];
type InterviewSection = Database['public']['Enums']['interview_section'];

export const useInterviewData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<InterviewProgress | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Load existing interview data
  useEffect(() => {
    if (user) {
      loadInterviewData();
    }
  }, [user]);

  const loadInterviewData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load progress
      const { data: progressData, error: progressError } = await supabase
        .from('interview_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Error loading progress:', progressError);
      } else if (progressData) {
        setProgress(progressData);
      }

      // Load answers
      const { data: answersData, error: answersError } = await supabase
        .from('interview_answers')
        .select('*')
        .eq('user_id', user.id);

      if (answersError) {
        console.error('Error loading answers:', answersError);
      } else if (answersData) {
        const answersMap: Record<string, any> = {
          generalQuestions: {},
          technicalScenarios: {},
          technicalExercises: {},
          cultureQuestions: {}
        };

        answersData.forEach((answer: InterviewAnswer) => {
          const sectionKey = answer.section === 'general' ? 'generalQuestions'
            : answer.section === 'technical_scenarios' ? 'technicalScenarios'
            : answer.section === 'technical_exercises' ? 'technicalExercises'
            : 'cultureQuestions';
          
          // Safely check if metadata is an object with type property
          const isComplexAnswer = answer.metadata && 
            typeof answer.metadata === 'object' && 
            answer.metadata !== null && 
            !Array.isArray(answer.metadata) &&
            'type' in answer.metadata && 
            (answer.metadata as any).type === 'complex';
          
          answersMap[sectionKey][answer.question_key] = isComplexAnswer && 'value' in (answer.metadata as any)
            ? (answer.metadata as any).value 
            : answer.answer;
        });

        setAnswers(answersMap);
      }
    } catch (error) {
      console.error('Error loading interview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = async (section: string, questionKey: string, value: any) => {
    if (!user) return;

    try {
      const sectionMapping: Record<string, InterviewSection> = {
        'generalQuestions': 'general',
        'technicalScenarios': 'technical_scenarios',
        'technicalExercises': 'technical_exercises',
        'cultureQuestions': 'culture'
      };

      const dbSection = sectionMapping[section];
      
      const answerData = {
        user_id: user.id,
        question_key: questionKey,
        section: dbSection,
        answer: typeof value === 'string' ? value : null,
        metadata: typeof value !== 'string' ? { type: 'complex', value } : {}
      };

      const { error } = await supabase
        .from('interview_answers')
        .upsert(answerData, {
          onConflict: 'user_id,question_key,section'
        });

      if (error) {
        console.error('Error saving answer:', error);
        toast({
          title: "Save failed",
          description: "Failed to save your answer. Please try again.",
          variant: "destructive"
        });
      } else {
        // Update local state
        setAnswers(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [questionKey]: value
          }
        }));
      }
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const updateProgress = async (step: number, completedSections?: any) => {
    if (!user) return;

    try {
      const progressData = {
        user_id: user.id,
        current_step: step,
        completed_sections: completedSections || progress?.completed_sections || {},
        submission_status: (step === 5 && completedSections ? 'completed' : 'in-progress') as Database['public']['Tables']['interview_progress']['Row']['submission_status'],
        submitted_at: step === 5 && completedSections ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from('interview_progress')
        .upsert(progressData, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating progress:', error);
      } else {
        setProgress(data);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return {
    loading,
    progress,
    answers,
    saveAnswer,
    updateProgress,
    loadInterviewData
  };
};
