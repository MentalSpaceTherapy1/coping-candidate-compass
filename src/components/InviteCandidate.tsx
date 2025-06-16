
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
      console.log('Sending invitation to:', candidateEmail);
      
      // Use supabase.functions.invoke instead of direct fetch
      const { data, error } = await supabase.functions.invoke('send-interview-invitation', {
        body: {
          candidateEmail: candidateEmail.trim(),
          candidateName: candidateName.trim() || null,
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to send invitation');
      }

      console.log('Invitation sent successfully:', data);

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
