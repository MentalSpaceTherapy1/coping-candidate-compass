
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SimpleInterviewFlow from "@/components/interview/SimpleInterviewFlow";
import { useInterviewData } from "@/hooks/useInterviewData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Interview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [validatingToken, setValidatingToken] = useState(false);
  const [candidateData, setCandidateData] = useState<{ email: string; name: string } | null>(null);
  const token = searchParams.get('token');

  // Only load interview data if user is authenticated OR if we have valid token data
  const { 
    loading: interviewLoading, 
    progress, 
    answers, 
    saveAnswer, 
    updateProgress 
  } = useInterviewData(candidateData?.email);

  // Handle invitation token and redirect logic
  useEffect(() => {
    const handleInvitationFlow = async () => {
      // If no token, user must be authenticated to access
      if (!token) {
        if (!authLoading && (!user || !profile)) {
          navigate('/login');
        }
        return;
      }
      
      // If user is already authenticated and has a token, clear token and proceed
      if (user && profile) {
        // Remove token from URL to clean it up
        navigate('/interview', { replace: true });
        return;
      }

      // If not authenticated but has token, validate it for anonymous access
      if (!user && !authLoading) {
        setValidatingToken(true);
        try {
          const { data: invitation, error } = await supabase
            .from('interview_invitations')
            .select('*')
            .eq('invitation_token', token)
            .gt('expires_at', new Date().toISOString())
            .single();

          if (error || !invitation) {
            toast({
              title: "Invalid Interview Link",
              description: "This interview link is invalid or has expired.",
              variant: "destructive"
            });
            navigate('/');
            return;
          }

          // Valid token - set candidate data for anonymous access
          setCandidateData({
            email: invitation.candidate_email,
            name: invitation.candidate_name || invitation.candidate_email
          });

        } catch (error) {
          console.error('Error validating token:', error);
          toast({
            title: "Error",
            description: "Failed to validate interview link.",
            variant: "destructive"
          });
          navigate('/');
        } finally {
          setValidatingToken(false);
        }
      }
    };

    handleInvitationFlow();
  }, [token, user, profile, authLoading, toast, navigate]);

  // Show loading state while checking auth or validating token
  if (authLoading || validatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="font-medium">Loading...</h3>
                <p className="text-sm text-gray-500">
                  {validatingToken ? 'Validating interview link...' : 'Loading interview...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is not authenticated and no valid token/candidate data, redirect to login
  if (!user && !candidateData) {
    return null; // This should not render as useEffect will redirect
  }

  // Show interview content for authenticated users OR anonymous users with valid tokens
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {candidateData && (
        <div className="bg-blue-50 border-b border-blue-200 py-3">
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-sm text-blue-700">
              <strong>Interview for:</strong> {candidateData.name} ({candidateData.email})
            </p>
          </div>
        </div>
      )}
      
      <SimpleInterviewFlow
        progress={progress}
        answers={answers}
        saveAnswer={saveAnswer}
        updateProgress={updateProgress}
        loading={interviewLoading}
      />
    </div>
  );
};

export default Interview;
