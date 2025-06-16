
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
      
      console.log('Fetching candidates...');
      
      // Get all candidate profiles (guaranteed to exist for all users)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'candidate');

      console.log('Candidate profiles:', profiles);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to fetch candidate profiles: " + profilesError.message,
          variant: "destructive"
        });
        return;
      }

      // Get all interview progress records  
      const { data: allProgress, error: progressError } = await supabase
        .from('interview_progress')
        .select('*');

      console.log('All interview progress records:', allProgress);

      if (progressError) {
        console.error('Error fetching progress:', progressError);
        toast({
          title: "Error",
          description: "Failed to fetch interview progress: " + progressError.message,
          variant: "destructive"
        });
        return;
      }

      const transformedCandidates: Candidate[] = [];

      // Process all candidate profiles
      if (profiles) {
        for (const profile of profiles) {
          // Find corresponding interview progress
          const progress = allProgress?.find(p => p.user_id === profile.id);
          
          console.log(`Processing candidate ${profile.id}:`, { profile, progress });
          
          let submissionStatus = 'not-started';
          let dateSubmitted = profile.created_at;
          
          if (progress) {
            submissionStatus = progress.submission_status || 'not-started';
            dateSubmitted = progress.submitted_at || progress.created_at || profile.created_at;
          }
          
          transformedCandidates.push({
            id: profile.id,
            name: profile.full_name,
            email: profile.email,
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
