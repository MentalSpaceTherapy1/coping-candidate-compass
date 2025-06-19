import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, Download, Trash2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

interface CandidateActionsProps {
  candidate: Candidate;
  onCandidateDeleted?: () => void;
  onInviteResent?: () => void;
}

export const CandidateActions = ({ candidate, onCandidateDeleted, onInviteResent }: CandidateActionsProps) => {
  const [deletingCandidateId, setDeletingCandidateId] = useState<string | null>(null);
  const [resendingInviteId, setResendingInviteId] = useState<string | null>(null);
  const { toast } = useToast();

  const canReview = (candidate: Candidate) => {
    return !candidate.id.startsWith('invitation-') && 
           (candidate.submissionStatus === 'completed' || 
            candidate.submissionStatus === 'in-progress' || 
            candidate.submissionStatus === 'draft');
  };

  const canExport = (candidate: Candidate) => {
    return candidate.submissionStatus === 'completed' || candidate.submissionStatus === 'in-progress';
  };

  const canResendInvite = (candidate: Candidate) => {
    return candidate.submissionStatus === 'invited' || candidate.submissionStatus === 'not-started';
  };

  const handleExport = (candidate: Candidate) => {
    if (!canExport(candidate)) return;
    
    const exportData = {
      name: candidate.name,
      email: candidate.email,
      status: candidate.submissionStatus,
      dateSubmitted: candidate.dateSubmitted,
      overallScore: candidate.overallScore,
      sections: candidate.sections
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `candidate-${candidate.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleDeleteCandidate = async (candidate: Candidate) => {
    setDeletingCandidateId(candidate.id);
    
    try {
      if (candidate.id.startsWith('invitation-')) {
        const invitationId = candidate.id.replace('invitation-', '');
        
        const { error } = await supabase
          .from('interview_invitations')
          .delete()
          .eq('id', invitationId);
        
        if (error) {
          throw error;
        }
      } else {
        // Delete in the correct order to avoid foreign key constraints
        
        // 1. Delete interview answers
        const { error: answersError } = await supabase
          .from('interview_answers')
          .delete()
          .eq('user_id', candidate.id);
        
        if (answersError) {
          throw answersError;
        }
        
        // 2. Delete interview progress
        const { error: progressError } = await supabase
          .from('interview_progress')
          .delete()
          .eq('user_id', candidate.id);
        
        if (progressError) {
          throw progressError;
        }
        
        // 3. Delete exercise uploads
        const { error: uploadsError } = await supabase
          .from('exercise_uploads')
          .delete()
          .eq('user_id', candidate.id);
        
        if (uploadsError) {
          throw uploadsError;
        }
        
        // 4. Delete admin notes
        const { error: notesError } = await supabase
          .from('admin_notes')
          .delete()
          .eq('candidate_id', candidate.id);
        
        if (notesError) {
          throw notesError;
        }
        
        // 5. Finally, delete the profile
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', candidate.id);
        
        if (profileError) {
          throw profileError;
        }
      }
      
      toast({
        title: "Candidate Deleted",
        description: `${candidate.name} has been successfully deleted.`,
      });
      
      onCandidateDeleted?.();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete candidate: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setDeletingCandidateId(null);
    }
  };

  const handleResendInvite = async (candidate: Candidate) => {
    setResendingInviteId(candidate.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-interview-invitation', {
        body: {
          candidateEmail: candidate.email,
          candidateName: candidate.name !== candidate.email ? candidate.name : null,
        }
      });

      if (error) throw error;

      toast({
        title: "Invitation Resent",
        description: `Interview invitation has been resent to ${candidate.email}`,
      });
      
      onInviteResent?.();
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to resend invitation: " + error.message,
        variant: "destructive"
      });
    } finally {
      setResendingInviteId(null);
    }
  };

  return (
    <div className="flex space-x-2">
      {canReview(candidate) ? (
        <Link to={`/admin/candidate/${candidate.id}`}>
          <Button size="sm" variant="outline">
            <Eye className="w-4 h-4 mr-1" />
            Review
          </Button>
        </Link>
      ) : (
        <Button size="sm" variant="outline" disabled>
          <Eye className="w-4 h-4 mr-1" />
          {candidate.submissionStatus === 'invited' ? 'Awaiting Registration' : 'No Data'}
        </Button>
      )}
      
      <Button 
        size="sm" 
        variant="outline" 
        disabled={!canExport(candidate)}
        onClick={() => handleExport(candidate)}
      >
        <Download className="w-4 h-4 mr-1" />
        Export
      </Button>

      {canResendInvite(candidate) && (
        <Button 
          size="sm" 
          variant="outline"
          disabled={resendingInviteId === candidate.id}
          onClick={() => handleResendInvite(candidate)}
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${resendingInviteId === candidate.id ? 'animate-spin' : ''}`} />
          Resend
        </Button>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            size="sm" 
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={deletingCandidateId === candidate.id}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {deletingCandidateId === candidate.id ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{candidate.name}</strong>? 
              This action cannot be undone and will permanently remove all their data including 
              interview answers, progress, exercise uploads, admin notes, and profile information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => handleDeleteCandidate(candidate)}
            >
              Delete Candidate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
