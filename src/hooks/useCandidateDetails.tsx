
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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

      const { data: progressData, error: progressError } = await supabase
        .from('interview_progress')
        .select('*')
        .eq('user_id', candidateId)
        .maybeSingle();

      if (progressError) {
        console.error('Error fetching progress:', progressError);
      }

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

      // Get admin notes for scoring
      const { data: adminNotes, error: notesError } = await supabase
        .from('admin_notes')
        .select('*')
        .eq('candidate_id', candidateId);

      if (notesError) {
        console.error('Error fetching admin notes:', notesError);
      }

      // Organize answers by section
      const sections = {
        general: { score: null, answers: [] as string[] },
        technical: { score: null, answers: [] as string[] },
        exercises: { score: null, answers: [] as string[] },
        culture: { score: null, answers: [] as string[] }
      };

      if (answersData) {
        answersData.forEach((answer) => {
          const sectionKey = answer.section === 'general' ? 'general'
            : answer.section === 'technical_scenarios' ? 'technical'
            : answer.section === 'technical_exercises' ? 'exercises'
            : 'culture';
          
          if (answer.answer) {
            sections[sectionKey].answers.push(answer.answer);
          }
        });
      }

      // Calculate scores from admin notes
      if (adminNotes) {
        adminNotes.forEach((note) => {
          if (note.rating && note.section) {
            const sectionKey = note.section === 'general' ? 'general'
              : note.section === 'technical_scenarios' ? 'technical'
              : note.section === 'technical_exercises' ? 'exercises'
              : 'culture';
            
            sections[sectionKey].score = note.rating;
          }
        });
      }

      // Calculate overall score
      const ratings = Object.values(sections)
        .map(section => section.score)
        .filter(score => score !== null);
      
      const overallScore = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : null;

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
        phone: candidateProfile.phone,
        linkedin: candidateProfile.linkedin_url,
        submissionStatus,
        dateSubmitted,
        overallScore,
        sections,
        progress: progressData
      });

    } catch (error) {
      console.error('Error in fetchCandidateDetails:', error);
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
