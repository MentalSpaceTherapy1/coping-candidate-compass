
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CandidateDetails {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  linkedin: string | null;
  submissionStatus: string;
  dateSubmitted: string;
  overallScore: number | null;
  sections: {
    general: { score: number | null; answers: string[] };
    technical: { score: number | null; answers: string[] };
    exercises: { score: number | null; answers: string[] };
    culture: { score: number | null; answers: string[] };
  };
}

export const useCandidateDetails = (candidateId: string) => {
  const [candidate, setCandidate] = useState<CandidateDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCandidateDetails = async () => {
      if (!candidateId || candidateId.startsWith('invitation-')) {
        setError('Invalid candidate ID or candidate has not started the interview yet');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching details for candidate:', candidateId);

        // Fetch candidate profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', candidateId)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Failed to fetch candidate profile');
          setLoading(false);
          return;
        }

        // Fetch interview progress
        const { data: progress, error: progressError } = await supabase
          .from('interview_progress')
          .select('*')
          .eq('user_id', candidateId)
          .single();

        if (progressError && progressError.code !== 'PGRST116') {
          console.error('Error fetching progress:', progressError);
        }

        // Fetch interview answers
        const { data: answers, error: answersError } = await supabase
          .from('interview_answers')
          .select('*')
          .eq('user_id', candidateId);

        if (answersError) {
          console.error('Error fetching answers:', answersError);
          toast({
            title: "Error",
            description: "Failed to fetch candidate answers",
            variant: "destructive"
          });
        }

        // Process answers by section
        const sectionAnswers = {
          general: { score: null, answers: [] as string[] },
          technical: { score: null, answers: [] as string[] },
          exercises: { score: null, answers: [] as string[] },
          culture: { score: null, answers: [] as string[] }
        };

        if (answers) {
          answers.forEach(answer => {
            const sectionKey = answer.section === 'general' ? 'general'
              : answer.section === 'technical_scenarios' ? 'technical'
              : answer.section === 'technical_exercises' ? 'exercises'
              : 'culture';

            if (answer.answer) {
              sectionAnswers[sectionKey].answers.push(answer.answer);
            }
          });
        }

        const candidateDetails: CandidateDetails = {
          id: profile.id,
          name: profile.full_name || profile.email,
          email: profile.email,
          phone: profile.phone,
          linkedin: profile.linkedin_url,
          submissionStatus: progress?.submission_status || 'not-started',
          dateSubmitted: progress?.submitted_at || progress?.created_at || profile.created_at,
          overallScore: null, // Can be calculated later if needed
          sections: sectionAnswers
        };

        console.log('Candidate details loaded:', candidateDetails);
        setCandidate(candidateDetails);
        setError(null);

      } catch (error) {
        console.error('Error fetching candidate details:', error);
        setError('Failed to fetch candidate details');
        toast({
          title: "Error",
          description: "Failed to fetch candidate details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateDetails();
  }, [candidateId, toast]);

  return { candidate, loading, error };
};
