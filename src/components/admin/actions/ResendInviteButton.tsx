
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
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

interface ResendInviteButtonProps {
  candidate: Candidate;
  onInviteResent?: () => void;
}

export const ResendInviteButton = ({ candidate, onInviteResent }: ResendInviteButtonProps) => {
  const [resendingInviteId, setResendingInviteId] = useState<string | null>(null);
  const { toast } = useToast();

  const canResendInvite = (candidate: Candidate) => {
    return candidate.submissionStatus === 'invited' || candidate.submissionStatus === 'not-started';
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
      toast({
        title: "Error",
        description: "Failed to resend invitation: " + error.message,
        variant: "destructive"
      });
    } finally {
      setResendingInviteId(null);
    }
  };

  if (!canResendInvite(candidate)) {
    return null;
  }

  return (
    <Button 
      size="sm" 
      variant="outline"
      disabled={resendingInviteId === candidate.id}
      onClick={() => handleResendInvite(candidate)}
    >
      <RefreshCw className={`w-4 h-4 mr-1 ${resendingInviteId === candidate.id ? 'animate-spin' : ''}`} />
      Resend
    </Button>
  );
};
