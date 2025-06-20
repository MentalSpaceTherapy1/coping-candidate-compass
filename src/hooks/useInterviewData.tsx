
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { debounce } from '@/utils/debounce';
import { InterviewAnswerService } from '@/services/interviewAnswerService';
import { InterviewProgressService } from '@/services/interviewProgressService';
import type { Database } from '@/integrations/supabase/types';

type InterviewProgress = Database['public']['Tables']['interview_progress']['Row'];

export const useInterviewData = (candidateEmail?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<InterviewProgress | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Use either authenticated user ID or candidate email as identifier
  const identifier = user?.id || candidateEmail;

  useEffect(() => {
    if (identifier) {
      loadInterviewData();
    }
  }, [identifier]);

  const loadInterviewData = async () => {
    if (!identifier) {
      return;
    }
    
    setLoading(true);
    
    try {
      let progressData = null;
      let answersData = null;

      if (user?.id) {
        // Authenticated user - use user ID
        const { data: pData, error: progressError } = await InterviewProgressService.loadProgress(user.id);
        if (progressError && progressError.code !== 'PGRST116') {
          console.error('Error loading progress:', progressError);
        } else if (pData) {
          progressData = pData;
        }

        const { data: aData, error: answersError } = await InterviewAnswerService.loadAnswers(user.id);
        if (answersError) {
          console.error('Error loading answers:', answersError);
        } else if (aData) {
          answersData = aData;
        }
      } else if (candidateEmail) {
        // Anonymous user with candidate email - use email-based storage
        const { data: pData, error: progressError } = await InterviewProgressService.loadProgressByEmail(candidateEmail);
        if (progressError && progressError.code !== 'PGRST116') {
          console.error('Error loading progress:', progressError);
        } else if (pData) {
          progressData = pData;
        }

        const { data: aData, error: answersError } = await InterviewAnswerService.loadAnswersByEmail(candidateEmail);
        if (answersError) {
          console.error('Error loading answers:', answersError);
        } else if (aData) {
          answersData = aData;
        }
      }

      if (progressData) {
        setProgress(progressData);
      }

      if (answersData) {
        const processedAnswers = InterviewAnswerService.processAnswersData(answersData);
        setAnswers(processedAnswers);
      }
    } catch (error) {
      console.error('Error loading interview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSave = useCallback(
    debounce(async (section: string, questionKey: string, value: any) => {
      if (!identifier) {
        return;
      }

      try {
        let data, error;

        if (user?.id) {
          // Authenticated user
          ({ data, error } = await InterviewAnswerService.saveAnswer(user.id, section, questionKey, value));
        } else if (candidateEmail) {
          // Anonymous user with candidate email
          ({ data, error } = await InterviewAnswerService.saveAnswerByEmail(candidateEmail, section, questionKey, value));
        }

        if (error) {
          console.error('Error saving answer:', error);
          toast({
            title: "Save failed",
            description: "Failed to save your answer. Please try again.",
            variant: "destructive"
          });
        } else {
          setAnswers(prev => ({
            ...prev,
            [section]: {
              ...prev[section],
              [questionKey]: value
            }
          }));
          
          setLastSaved(new Date());
          if (Math.random() < 0.1) {
            toast({
              title: "Progress saved",
              description: "Your answers have been automatically saved.",
            });
          }
        }
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }, 2000),
    [identifier, user, candidateEmail, toast]
  );

  const saveAnswer = async (section: string, questionKey: string, value: any) => {
    if (value && (typeof value === 'string' ? value.trim() : true)) {
      debouncedSave(section, questionKey, value);
    }
  };

  const updateProgress = async (step: number, completedSections?: any) => {
    if (!identifier) {
      return;
    }

    try {
      let data, error;

      if (user?.id) {
        // Authenticated user
        ({ data, error } = await InterviewProgressService.updateProgress(user.id, step, completedSections));
      } else if (candidateEmail) {
        // Anonymous user with candidate email
        ({ data, error } = await InterviewProgressService.updateProgressByEmail(candidateEmail, step, completedSections));
      }

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
    loadInterviewData,
    lastSaved
  };
};
