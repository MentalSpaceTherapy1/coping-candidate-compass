import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Candidate } from "@/types/candidate";

interface DeleteCandidateDialogProps {
  candidate: Candidate;
  onCandidateDeleted?: () => void;
}

export const DeleteCandidateDialog = ({ candidate, onCandidateDeleted }: DeleteCandidateDialogProps) => {
  const [deletingCandidateId, setDeletingCandidateId] = useState<string | null>(null);
  const { toast } = useToast();

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

  return (
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
  );
};
