
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { debounce } from '@/utils/debounce';
import { InterviewAnswerService } from '@/services/interviewAnswerService';
import { InterviewProgressService } from '@/services/interviewProgressService';
import type { Database } from '@/integrations/supabase/types';

type InterviewProgress = Database['public']['Tables']['interview_progress']['Row'];

export const useInterviewData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<InterviewProgress | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load existing interview data
  useEffect(() => {
    if (user) {
      console.log('🔄 Loading interview data for user:', user.id);
      loadInterviewData();
    }
  }, [user]);

  const loadInterviewData = async () => {
    if (!user) {
      console.log('❌ No user found, cannot load interview data');
      return;
    }
    
    setLoading(true);
    console.log('📊 Starting to load interview data...');
    
    try {
      // Load progress
      const { data: progressData, error: progressError } = await InterviewProgressService.loadProgress(user.id);

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('❌ Error loading progress:', progressError);
      } else if (progressData) {
        console.log('✅ Progress loaded:', progressData);
        setProgress(progressData);
      } else {
        console.log('📝 No progress found for user');
      }

      // Load answers
      const { data: answersData, error: answersError } = await InterviewAnswerService.loadAnswers(user.id);

      if (answersError) {
        console.error('❌ Error loading answers:', answersError);
      } else if (answersData) {
        console.log('✅ Answers loaded:', answersData.length, 'answers found');
        const processedAnswers = InterviewAnswerService.processAnswersData(answersData);
        setAnswers(processedAnswers);
      } else {
        console.log('📝 No answers found for user');
      }
    } catch (error) {
      console.error('💥 Unexpected error loading interview data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced save function to prevent constant notifications
  const debouncedSave = useCallback(
    debounce(async (section: string, questionKey: string, value: any) => {
      if (!user) {
        console.log('❌ No user found, cannot save answer');
        return;
      }

      try {
        const { data, error } = await InterviewAnswerService.saveAnswer(user.id, section, questionKey, value);

        if (error) {
          console.error('❌ Error saving answer:', error);
          toast({
            title: "Save failed",
            description: "Failed to save your answer. Please try again.",
            variant: "destructive"
          });
        } else {
          console.log('✅ Answer saved successfully:', data);
          
          // Update local state
          setAnswers(prev => ({
            ...prev,
            [section]: {
              ...prev[section],
              [questionKey]: value
            }
          }));
          
          setLastSaved(new Date());
          // Only show success toast occasionally, not on every save
          if (Math.random() < 0.2) { // 20% chance to show toast
            toast({
              title: "Progress saved",
              description: "Your answers have been automatically saved.",
            });
          }
        }
      } catch (error) {
        console.error('💥 Unexpected error saving answer:', error);
      }
    }, 2000), // Wait 2 seconds after user stops typing
    [user, toast]
  );

  const saveAnswer = async (section: string, questionKey: string, value: any) => {
    console.log('🔄 saveAnswer called:', { section, questionKey, hasValue: !!value });
    
    // Only save if value is not empty
    if (value && (typeof value === 'string' ? value.trim() : true)) {
      console.log('✅ Value is valid, proceeding with save');
      debouncedSave(section, questionKey, value);
    } else {
      console.log('⚠️ Value is empty or invalid, skipping save');
    }
  };

  const updateProgress = async (step: number, completedSections?: any) => {
    if (!user) {
      console.log('❌ No user found, cannot update progress');
      return;
    }

    try {
      const { data, error } = await InterviewProgressService.updateProgress(user.id, step, completedSections);

      if (error) {
        console.error('❌ Error updating progress:', error);
      } else {
        console.log('✅ Progress updated successfully:', data);
        setProgress(data);
      }
    } catch (error) {
      console.error('💥 Unexpected error updating progress:', error);
    }
  };

  return {
    loading,
    progress,
    answers,
    saveAnswer,
    updateProgress,
    loadInterviewData,
    lastSaved
  };
};
