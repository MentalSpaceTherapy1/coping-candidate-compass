
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
      console.log(`🗑️ Starting deletion process for candidate: ${candidate.name} (${candidate.id})`);
      
      if (candidate.id.startsWith('invitation-')) {
        const invitationId = candidate.id.replace('invitation-', '');
        console.log(`🔍 Deleting invitation with ID: ${invitationId}`);
        
        const { error } = await supabase
          .from('interview_invitations')
          .delete()
          .eq('id', invitationId);
        
        if (error) {
          console.error('❌ Error deleting invitation:', error);
          throw error;
        }
        
        console.log(`✅ Successfully deleted invitation: ${invitationId}`);
      } else {
        console.log(`🔍 Deleting registered user with ID: ${candidate.id}`);
        
        // Delete in the correct order to avoid foreign key constraints
        
        // 1. Delete interview answers
        console.log('🗑️ Deleting interview answers...');
        const { error: answersError } = await supabase
          .from('interview_answers')
          .delete()
          .eq('user_id', candidate.id);
        
        if (answersError) {
          console.error('❌ Error deleting interview answers:', answersError);
          throw answersError;
        }
        
        // 2. Delete interview progress
        console.log('🗑️ Deleting interview progress...');
        const { error: progressError } = await supabase
          .from('interview_progress')
          .delete()
          .eq('user_id', candidate.id);
        
        if (progressError) {
          console.error('❌ Error deleting interview progress:', progressError);
          throw progressError;
        }
        
        // 3. Delete exercise uploads
        console.log('🗑️ Deleting exercise uploads...');
        const { error: uploadsError } = await supabase
          .from('exercise_uploads')
          .delete()
          .eq('user_id', candidate.id);
        
        if (uploadsError) {
          console.error('❌ Error deleting exercise uploads:', uploadsError);
          throw uploadsError;
        }
        
        // 4. Delete admin notes
        console.log('🗑️ Deleting admin notes...');
        const { error: notesError } = await supabase
          .from('admin_notes')
          .delete()
          .eq('candidate_id', candidate.id);
        
        if (notesError) {
          console.error('❌ Error deleting admin notes:', notesError);
          throw notesError;
        }
        
        // 5. Finally, delete the profile
        console.log('🗑️ Deleting profile...');
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', candidate.id);
        
        if (profileError) {
          console.error('❌ Error deleting profile:', profileError);
          throw profileError;
        }
        
        console.log(`✅ Successfully deleted all data for user: ${candidate.id}`);
      }
      
      toast({
        title: "Candidate Deleted",
        description: `${candidate.name} has been successfully deleted.`,
      });
      
      console.log('🔄 Triggering candidate list refresh...');
      onCandidateDeleted?.();
      
    } catch (error: any) {
      console.error('💥 Error deleting candidate:', error);
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
