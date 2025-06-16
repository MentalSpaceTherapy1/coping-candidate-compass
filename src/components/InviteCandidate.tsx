
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function InviteCandidate() {
  const [isOpen, setIsOpen] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendInvitation = async () => {
    if (!candidateEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a candidate email",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/functions/v1/send-interview-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          candidateEmail: candidateEmail.trim(),
          candidateName: candidateName.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invitation');
      }

      toast({
        title: "Invitation Sent!",
        description: `Interview invitation has been sent to ${candidateEmail}`,
      });

      // Reset form and close dialog
      setCandidateName("");
      setCandidateEmail("");
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Mail className="w-4 h-4 mr-2" />
          Invite Candidate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Send Interview Invitation</span>
          </DialogTitle>
          <DialogDescription>
            Send an interview invitation link to a candidate via email.
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="candidateName">Candidate Name (Optional)</Label>
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
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendInvitation}
                  disabled={isLoading || !candidateEmail.trim()}
                  className="flex-1"
                >
                  {isLoading ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
