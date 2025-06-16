
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
  const { user, profile } = useAuth();

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching candidates...');
      console.log('Current user:', user?.id);
      console.log('Current user profile:', profile);
      console.log('User role:', profile?.role);
      
      // Try to get all profiles first to see what we can access
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('*');

      console.log('📊 All profiles query result:', { allProfiles, error: allProfilesError });

      if (allProfilesError) {
        console.error('❌ Error fetching all profiles:', allProfilesError);
        toast({
          title: "Error",
          description: "Failed to fetch profiles: " + allProfilesError.message,
          variant: "destructive"
        });
        return;
      }

      // Filter for candidates (anyone who is not an admin)
      const candidateProfiles = allProfiles?.filter(profile => profile.role === 'candidate') || [];
      
      console.log('📊 Candidate profiles found:', candidateProfiles);

      // Get all interview progress records
      const { data: progressRecords, error: progressError } = await supabase
        .from('interview_progress')
        .select('*');

      console.log('📊 Interview progress records:', { progressRecords, error: progressError });

      if (progressError) {
        console.error('❌ Error fetching interview progress:', progressError);
        // Don't return here, continue without progress data
      }

      const transformedCandidates: Candidate[] = [];

      if (candidateProfiles && candidateProfiles.length > 0) {
        console.log(`✅ Found ${candidateProfiles.length} candidate profiles`);
        
        for (const profile of candidateProfiles) {
          // Find the progress record for this candidate
          const progress = progressRecords?.find(p => p.user_id === profile.id);
          
          console.log(`🔍 Processing candidate ${profile.id} (${profile.full_name}):`, { profile, progress });
          
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
      } else {
        console.log('⚠️ No candidate profiles found');
      }

      console.log('✅ Final transformed candidates:', transformedCandidates);
      setCandidates(transformedCandidates);
      
    } catch (error) {
      console.error('💥 Unexpected error in fetchCandidates:', error);
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
    // Only fetch if user is logged in and is admin
    if (user && profile?.role === 'admin') {
      console.log('🚀 User is admin, fetching candidates...');
      fetchCandidates();
    } else {
      console.log('❌ User not admin or not logged in', { user: !!user, role: profile?.role });
      setLoading(false);
    }
  }, [user, profile]);

  return {
    candidates,
    loading,
    refetchCandidates: fetchCandidates
  };
};
