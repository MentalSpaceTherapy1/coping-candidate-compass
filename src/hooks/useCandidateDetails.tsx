
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface CandidateDetails {
  id: string;
  name: string;
  email: string;
  submissionStatus: string;
  dateSubmitted: string;
  sections: {
    generalQuestions: any[];
    technicalScenarios: any[];
    technicalExercises: any[];
    cultureQuestions: any[];
  };
  progress?: any;
}

export const useCandidateDetails = (candidateId: string) => {
  const [candidate, setCandidate] = useState<CandidateDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const fetchCandidateDetails = async () => {
    try {
      setLoading(true);
      
      if (!user || profile?.role !== 'admin') {
        setLoading(false);
        return;
      }

      console.log('Fetching candidate details for:', candidateId);

      // This is a real user ID, fetch their profile and interview data
      const { data: candidateProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (profileError) {
        console.error('Error fetching candidate profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to fetch candidate profile: " + profileError.message,
          variant: "destructive"
        });
        return;
      }

      // Get interview progress
      const { data: progressData, error: progressError } = await supabase
        .from('interview_progress')
        .select('*')
        .eq('user_id', candidateId)
        .maybeSingle();

      if (progressError) {
        console.error('Error fetching progress:', progressError);
      }

      // Get all interview answers
      const { data: answersData, error: answersError } = await supabase
        .from('interview_answers')
        .select('*')
        .eq('user_id', candidateId);

      if (answersError) {
        console.error('Error fetching answers:', answersError);
        toast({
          title: "Error",
          description: "Failed to fetch interview answers: " + answersError.message,
          variant: "destructive"
        });
      }

      // Organize answers by section
      const sections = {
        generalQuestions: [],
        technicalScenarios: [],
        technicalExercises: [],
        cultureQuestions: []
      };

      if (answersData) {
        answersData.forEach((answer) => {
          const sectionKey = answer.section === 'general' ? 'generalQuestions'
            : answer.section === 'technical_scenarios' ? 'technicalScenarios'
            : answer.section === 'technical_exercises' ? 'technicalExercises'
            : 'cultureQuestions';
          
          sections[sectionKey].push({
            questionKey: answer.question_key,
            answer: answer.answer,
            metadata: answer.metadata,
            createdAt: answer.created_at,
            updatedAt: answer.updated_at
          });
        });
      }

      let submissionStatus = 'not-started';
      let dateSubmitted = candidateProfile.created_at;
      
      if (progressData) {
        submissionStatus = progressData.submission_status || 'not-started';
        dateSubmitted = progressData.submitted_at || progressData.updated_at || progressData.created_at || candidateProfile.created_at;
      }

      setCandidate({
        id: candidateId,
        name: candidateProfile.full_name || candidateProfile.email,
        email: candidateProfile.email,
        submissionStatus,
        dateSubmitted,
        sections,
        progress: progressData
      });

    } catch (error) {
      console.error('Unexpected error in fetchCandidateDetails:', error);
      toast({
        title: "Error",
        description: "Failed to fetch candidate details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (candidateId && user && profile?.role === 'admin') {
      fetchCandidateDetails();
    } else {
      setLoading(false);
    }
  }, [candidateId, user, profile]);

  return {
    candidate,
    loading,
    refetchCandidate: fetchCandidateDetails
  };
};
