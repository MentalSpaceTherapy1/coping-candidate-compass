
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
      if (!candidateId) {
        setError('Invalid candidate ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching details for candidate:', candidateId);

        // Check if this is an invitation ID
        if (candidateId.startsWith('invitation-')) {
          const invitationId = candidateId.replace('invitation-', '');
          
          // Fetch invitation details
          const { data: invitation, error: invitationError } = await supabase
            .from('interview_invitations')
            .select('*')
            .eq('id', invitationId)
            .single();

          if (invitationError) {
            console.error('Error fetching invitation:', invitationError);
            setError('Failed to fetch candidate invitation details');
            setLoading(false);
            return;
          }

          // Now check if this invited candidate has actually started the interview
          // by looking for a user profile with the same email
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', invitation.candidate_email)
            .maybeSingle();

          let candidateDetails: CandidateDetails;

          if (profile && !profileError) {
            // The invited candidate has created a profile and started the interview
            console.log('Found profile for invited candidate:', profile);

            // Fetch their interview progress
            const { data: progress, error: progressError } = await supabase
              .from('interview_progress')
              .select('*')
              .eq('user_id', profile.id)
              .maybeSingle();

            // Fetch their interview answers
            const { data: answers, error: answersError } = await supabase
              .from('interview_answers')
              .select('*')
              .eq('user_id', profile.id);

            if (answersError) {
              console.error('Error fetching answers:', answersError);
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

            candidateDetails = {
              id: candidateId,
              name: profile.full_name || invitation.candidate_name || invitation.candidate_email,
              email: invitation.candidate_email,
              phone: profile.phone,
              linkedin: profile.linkedin_url,
              submissionStatus: progress?.submission_status || 'in-progress',
              dateSubmitted: progress?.submitted_at || progress?.created_at || invitation.sent_at,
              overallScore: null,
              sections: sectionAnswers
            };
          } else {
            // The invited candidate hasn't started the interview yet
            candidateDetails = {
              id: candidateId,
              name: invitation.candidate_name || invitation.candidate_email,
              email: invitation.candidate_email,
              phone: null,
              linkedin: null,
              submissionStatus: 'invited',
              dateSubmitted: invitation.sent_at,
              overallScore: null,
              sections: {
                general: { score: null, answers: [] },
                technical: { score: null, answers: [] },
                exercises: { score: null, answers: [] },
                culture: { score: null, answers: [] }
              }
            };
          }

          console.log('Invitation-based candidate details loaded:', candidateDetails);
          setCandidate(candidateDetails);
          setError(null);
          setLoading(false);
          return;
        }

        // For real user IDs, fetch profile and answers
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
