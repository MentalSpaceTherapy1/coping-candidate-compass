
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
      console.log('🔄 Fetching candidates...');
      
      if (!user || profile?.role !== 'admin') {
        console.log('❌ User not authorized or not admin');
        setLoading(false);
        return;
      }

      // Get all candidate profiles
      console.log('📋 Fetching candidate profiles...');
      const { data: candidateProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'candidate');

      if (profilesError) {
        console.error('❌ Error fetching candidate profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to fetch candidate profiles: " + profilesError.message,
          variant: "destructive"
        });
      }

      // Get all interview invitations
      console.log('📋 Fetching interview invitations...');
      const { data: invitations, error: invitationsError } = await supabase
        .from('interview_invitations')
        .select('*')
        .order('sent_at', { ascending: false });

      if (invitationsError) {
        console.error('❌ Error fetching invitations:', invitationsError);
        toast({
          title: "Error",
          description: "Failed to fetch invitations: " + invitationsError.message,
          variant: "destructive"
        });
      }

      // Get all interview progress records
      console.log('📋 Fetching interview progress...');
      const { data: progressRecords, error: progressError } = await supabase
        .from('interview_progress')
        .select('*');

      if (progressError) {
        console.error('❌ Error fetching interview progress:', progressError);
        // Don't return here, continue without progress data
      }

      const transformedCandidates: Candidate[] = [];

      // Add existing candidate profiles
      if (candidateProfiles && candidateProfiles.length > 0) {
        console.log(`📊 Processing ${candidateProfiles.length} candidate profiles...`);
        for (const profile of candidateProfiles) {
          // Find the progress record for this candidate
          const progress = progressRecords?.find(p => p.user_id === profile.id);
          
          let submissionStatus = 'not-started';
          let dateSubmitted = profile.created_at;
          
          if (progress) {
            submissionStatus = progress.submission_status || 'not-started';
            dateSubmitted = progress.submitted_at || progress.updated_at || progress.created_at || profile.created_at;
          }
          
          transformedCandidates.push({
            id: profile.id, // Use the actual user profile ID
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

      // Add invited candidates who don't have profiles yet
      if (invitations && invitations.length > 0) {
        console.log(`📨 Processing ${invitations.length} invitations...`);
        for (const invitation of invitations) {
          // Check if this email already exists in our candidate profiles
          const existingCandidate = transformedCandidates.find(c => c.email === invitation.candidate_email);
          
          if (!existingCandidate) {
            // This is an invited candidate who hasn't created a profile yet
            // Use a prefixed ID to distinguish it from real user IDs
            transformedCandidates.push({
              id: `invitation-${invitation.id}`, // Prefix to distinguish invitation IDs
              name: invitation.candidate_name || invitation.candidate_email,
              email: invitation.candidate_email,
              submissionStatus: 'invited',
              dateSubmitted: invitation.sent_at,
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
      }

      // Sort candidates by date (most recent first)
      transformedCandidates.sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());

      console.log(`✅ Successfully loaded ${transformedCandidates.length} candidates`);
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
      fetchCandidates();
    } else {
      setLoading(false);
    }
  }, [user, profile]);

  return {
    candidates,
    loading,
    refetchCandidates: fetchCandidates
  };
};
