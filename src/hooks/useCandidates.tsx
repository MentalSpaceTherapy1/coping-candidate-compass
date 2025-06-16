
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
      
      // First, let's get all profiles with role 'candidate'
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'candidate');

      console.log('Candidate profiles from Supabase:', profiles);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to fetch candidate profiles: " + profilesError.message,
          variant: "destructive"
        });
        return;
      }

      // If no profiles found, let's check if there are any profiles at all
      if (!profiles || profiles.length === 0) {
        console.log('No candidate profiles found. Checking all profiles...');
        
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from('profiles')
          .select('*');
          
        console.log('All profiles in database:', allProfiles);
        
        if (allProfilesError) {
          console.error('Error fetching all profiles:', allProfilesError);
        }
      }

      // Get all interview progress records
      const { data: progressRecords, error: progressError } = await supabase
        .from('interview_progress')
        .select('*');

      console.log('Interview progress records:', progressRecords);

      if (progressError) {
        console.error('Error fetching interview progress:', progressError);
        // Don't return here, continue without progress data
      }

      const transformedCandidates: Candidate[] = [];

      if (profiles) {
        for (const profile of profiles) {
          // Find the progress record for this candidate
          const progress = progressRecords?.find(p => p.user_id === profile.id);
          
          console.log(`Processing candidate ${profile.id} (${profile.full_name}):`, { profile, progress });
          
          let submissionStatus = 'not-started';
          let dateSubmitted = profile.created_at;
          
          if (progress) {
            submissionStatus = progress.submission_status || 'not-started';
            dateSubmitted = progress.submitted_at || progress.updated_at || progress.created_at || profile.created_at;
          }
          
          transformedCandidates.push({
            id: profile.id,
            name: profile.full_name || profile.email,
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
      
      // If we still have no candidates, let's check the invitations table
      if (transformedCandidates.length === 0) {
        console.log('No candidates found, checking invitations...');
        
        const { data: invitations, error: invitationsError } = await supabase
          .from('interview_invitations')
          .select('*')
          .order('created_at', { ascending: false });
          
        console.log('Interview invitations:', invitations);
        
        if (invitationsError) {
          console.error('Error fetching invitations:', invitationsError);
        }
      }
      
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
