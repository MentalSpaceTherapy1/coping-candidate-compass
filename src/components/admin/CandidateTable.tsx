
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, Download, Star, Mail, Trash2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
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

interface CandidateTableProps {
  candidates: Candidate[];
  onCandidateDeleted?: () => void;
  onInviteResent?: () => void;
}

export const CandidateTable = ({ candidates, onCandidateDeleted, onInviteResent }: CandidateTableProps) => {
  const [deletingCandidateId, setDeletingCandidateId] = useState<string | null>(null);
  const [resendingInviteId, setResendingInviteId] = useState<string | null>(null);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Draft</Badge>;
      case "invited":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
          <Mail className="w-3 h-3 mr-1" />
          Invited
        </Badge>;
      case "not-started":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Not Started</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getScoreDisplay = (score: number | null) => {
    if (score === null) return <span className="text-gray-400">-</span>;
    return (
      <div className="flex items-center space-x-1">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="font-medium">{score.toFixed(1)}</span>
      </div>
    );
  };

  const canReview = (candidate: Candidate) => {
    // Only allow review for candidates who have created accounts and started/completed interviews
    return !candidate.id.startsWith('invitation-') && 
           (candidate.submissionStatus === 'completed' || 
            candidate.submissionStatus === 'in-progress' || 
            candidate.submissionStatus === 'draft');
  };

  const canExport = (candidate: Candidate) => {
    // Can only export if there's actual submission data
    return candidate.submissionStatus === 'completed' || candidate.submissionStatus === 'in-progress';
  };

  const canResendInvite = (candidate: Candidate) => {
    // Can resend invite for invited candidates or those who haven't started
    return candidate.submissionStatus === 'invited' || candidate.submissionStatus === 'not-started';
  };

  const handleExport = (candidate: Candidate) => {
    if (!canExport(candidate)) return;
    
    // Create a simple text export of the candidate's information
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
      // If it's an invitation-only candidate, delete from invitations table
      if (candidate.id.startsWith('invitation-')) {
        const invitationId = candidate.id.replace('invitation-', '');
        const { error } = await supabase
          .from('interview_invitations')
          .delete()
          .eq('id', invitationId);
        
        if (error) throw error;
      } else {
        // If it's a real user, delete their profile and related data
        const { error: answersError } = await supabase
          .from('interview_answers')
          .delete()
          .eq('user_id', candidate.id);
        
        const { error: progressError } = await supabase
          .from('interview_progress')
          .delete()
          .eq('user_id', candidate.id);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', candidate.id);
        
        if (profileError) throw profileError;
      }
      
      toast({
        title: "Candidate Deleted",
        description: `${candidate.name} has been successfully deleted.`,
      });
      
      onCandidateDeleted?.();
    } catch (error: any) {
      console.error('Error deleting candidate:', error);
      toast({
        title: "Error",
        description: "Failed to delete candidate: " + error.message,
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Candidate</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Overall Score</TableHead>
          <TableHead>Section Scores</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate) => (
          <TableRow key={candidate.id}>
            <TableCell>
              <div>
                <div className="font-medium">{candidate.name}</div>
                <div className="text-sm text-gray-500">{candidate.email}</div>
              </div>
            </TableCell>
            <TableCell>
              {getStatusBadge(candidate.submissionStatus)}
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>{new Date(candidate.dateSubmitted).toLocaleDateString()}</div>
                <div className="text-xs text-gray-500">
                  {candidate.submissionStatus === 'invited' ? 'Invited' : 'Submitted'}
                </div>
              </div>
            </TableCell>
            <TableCell>
              {getScoreDisplay(candidate.overallScore)}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                {Object.entries(candidate.sections).map(([key, score]) => (
                  <div key={key} className="text-xs">
                    <div className="font-medium capitalize">{key.substring(0, 3)}</div>
                    <div className="text-gray-500">
                      {score ? score.toFixed(1) : '-'}
                    </div>
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell>
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
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete <strong>{candidate.name}</strong>? 
                        This action cannot be undone and will permanently remove all their data including 
                        interview answers, progress, and profile information.
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
