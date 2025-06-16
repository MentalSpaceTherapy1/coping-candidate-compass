
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Candidate {
  id: string;
  name: string;
  email: string;
  submissionStatus: string;
  dateSubmitted: string;
  overallScore: number | null;
  sections: {
    general: number | null;
    technical: number | null;
    exercises: number | null;
    culture: number | null;
  };
}

export const useCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching all candidates...');
      
      // Get all candidate profiles with their interview progress in one query
      const { data: candidatesData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          created_at,
          interview_progress (
            submission_status,
            submitted_at,
            created_at,
            updated_at
          )
        `)
        .eq('role', 'candidate');

      console.log('Candidates data from Supabase:', candidatesData);

      if (error) {
        console.error('Error fetching candidates:', error);
        toast({
          title: "Error",
          description: "Failed to fetch candidates: " + error.message,
          variant: "destructive"
        });
        return;
      }

      const transformedCandidates: Candidate[] = [];

      if (candidatesData) {
        for (const candidate of candidatesData) {
          const progress = candidate.interview_progress?.[0]; // Get first progress record
          
          console.log(`Processing candidate ${candidate.id}:`, { candidate, progress });
          
          let submissionStatus = 'not-started';
          let dateSubmitted = candidate.created_at;
          
          if (progress) {
            submissionStatus = progress.submission_status || 'not-started';
            dateSubmitted = progress.submitted_at || progress.updated_at || progress.created_at || candidate.created_at;
          }
          
          transformedCandidates.push({
            id: candidate.id,
            name: candidate.full_name,
            email: candidate.email,
            submissionStatus,
            dateSubmitted,
            overallScore: null,
            sections: {
              general: null,
              technical: null,
              exercises: null,
              culture: null
            }
          });
        }
      }

      console.log('Final transformed candidates:', transformedCandidates);
      setCandidates(transformedCandidates);
    } catch (error) {
      console.error('Error in fetchCandidates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch candidate data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  return {
    candidates,
    loading,
    refetchCandidates: fetchCandidates
  };
};
