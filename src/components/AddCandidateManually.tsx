
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Copy, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AddCandidateManuallyProps {
  onCandidateAdded?: () => void;
}

export function AddCandidateManually({ onCandidateAdded }: AddCandidateManuallyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const { toast } = useToast();

  const handleAddCandidate = async () => {
    if (!candidateName.trim() || !candidateEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter both candidate name and email",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if candidate already exists
      const { data: existingInvitation, error: existingError } = await supabase
        .from('interview_invitations')
        .select('id, invitation_token')
        .eq('candidate_email', candidateEmail.trim().toLowerCase())
        .maybeSingle();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      let invitationToken;
      
      if (existingInvitation) {
        // Use existing token
        invitationToken = existingInvitation.invitation_token;
        toast({
          title: "Candidate Already Exists",
          description: "Using existing candidate's interview link",
          variant: "default"
        });
      } else {
        // Create new invitation record
        const { data: invitation, error } = await supabase
          .from('interview_invitations')
          .insert({
            candidate_email: candidateEmail.trim().toLowerCase(),
            candidate_name: candidateName.trim(),
            sent_by: (await supabase.auth.getUser()).data.user?.id,
            status: 'created'
          })
          .select('invitation_token')
          .single();

        if (error) {
          throw error;
        }

        invitationToken = invitation.invitation_token;
        
        toast({
          title: "Candidate Added!",
          description: `${candidateName} has been added successfully`,
        });
      }

      // Generate the interview link
      const interviewLink = `${window.location.origin}/interview?token=${invitationToken}`;
      setGeneratedLink(interviewLink);
      
      onCandidateAdded?.();
    } catch (error: any) {
      console.error('Error adding candidate:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add candidate",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Copied!",
        description: "Interview link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCandidateName("");
    setCandidateEmail("");
    setGeneratedLink("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Candidate Manually
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Add Candidate Manually</span>
          </DialogTitle>
          <DialogDescription>
            Create a unique interview link for a candidate without sending an email.
          </DialogDescription>
        </DialogHeader>
        
        {!generatedLink ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="candidateName">Candidate Name *</Label>
                  <Input
                    id="candidateName"
                    placeholder="John Doe"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidateEmail">Email Address *</Label>
                  <Input
                    id="candidateEmail"
                    type="email"
                    placeholder="candidate@example.com"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddCandidate}
                    disabled={isLoading || !candidateName.trim() || !candidateEmail.trim()}
                    className="flex-1"
                  >
                    {isLoading ? "Creating..." : "Create Link"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-600">Interview Link Generated!</CardTitle>
              <CardDescription>
                Share this unique link with {candidateName}. They can complete the interview without creating an account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-mono break-all">{generatedLink}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    onClick={() => window.open(generatedLink, '_blank')}
                    variant="outline"
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Test Link
                  </Button>
                </div>
                <Button
                  onClick={handleClose}
                  className="w-full"
                >
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
