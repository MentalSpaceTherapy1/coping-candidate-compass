
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
      
      if (!user || profile?.role !== 'admin') {
        setLoading(false);
        return;
      }

      const { data: candidateProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'candidate');

      if (profilesError) {
        console.error('Error fetching candidate profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to fetch candidate profiles: " + profilesError.message,
          variant: "destructive"
        });
      }

      const { data: invitations, error: invitationsError } = await supabase
        .from('interview_invitations')
        .select('*')
        .order('sent_at', { ascending: false });

      if (invitationsError) {
        console.error('Error fetching invitations:', invitationsError);
        toast({
          title: "Error",
          description: "Failed to fetch invitations: " + invitationsError.message,
          variant: "destructive"
        });
      }

      const { data: progressRecords, error: progressError } = await supabase
        .from('interview_progress')
        .select('*');

      if (progressError) {
        console.error('Error fetching interview progress:', progressError);
      }

      // Get admin notes for overall scoring
      const { data: adminNotes, error: notesError } = await supabase
        .from('admin_notes')
        .select('candidate_id, rating');

      if (notesError) {
        console.error('Error fetching admin notes:', notesError);
      }

      const transformedCandidates: Candidate[] = [];

      // Add existing candidate profiles
      if (candidateProfiles && candidateProfiles.length > 0) {
        for (const profile of candidateProfiles) {
          const progress = progressRecords?.find(p => p.user_id === profile.id);
          
          let submissionStatus = 'not-started';
          let dateSubmitted = profile.created_at;
          
          if (progress) {
            submissionStatus = progress.submission_status || 'not-started';
            dateSubmitted = progress.submitted_at || progress.updated_at || progress.created_at || profile.created_at;
          }

          // Calculate overall score from admin notes
          const candidateNotes = adminNotes?.filter(note => note.candidate_id === profile.id) || [];
          let overallScore = null;
          if (candidateNotes.length > 0) {
            const ratings = candidateNotes.filter(note => note.rating !== null).map(note => note.rating);
            if (ratings.length > 0) {
              overallScore = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
            }
          }
          
          transformedCandidates.push({
            id: profile.id,
            name: profile.full_name || profile.email,
            email: profile.email,
            submissionStatus,
            dateSubmitted,
            overallScore,
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
        for (const invitation of invitations) {
          const existingCandidate = transformedCandidates.find(c => c.email === invitation.candidate_email);
          
          if (!existingCandidate) {
            transformedCandidates.push({
              id: `invitation-${invitation.id}`,
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

      transformedCandidates.sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
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
