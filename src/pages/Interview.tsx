
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
  const token = searchParams.get('token');

  // Only load interview data if user is authenticated
  const { 
    loading: interviewLoading, 
    progress, 
    answers, 
    saveAnswer, 
    updateProgress 
  } = useInterviewData();

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

      // If not authenticated but has token, validate it and redirect to registration
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
              title: "Invalid Invitation",
              description: "This invitation link is invalid or has expired.",
              variant: "destructive"
            });
            navigate('/');
            return;
          }

          // Valid token - redirect to registration with token
          navigate(`/register?token=${token}`, { replace: true });
        } catch (error) {
          console.error('Error validating token:', error);
          toast({
            title: "Error",
            description: "Failed to validate invitation link.",
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
                  {validatingToken ? 'Validating invitation...' : 'Loading interview...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is not authenticated and no token, redirect to login
  if (!user || !profile) {
    return null; // This should not render as useEffect will redirect
  }

  // User is authenticated - show interview content
  return (
    <SimpleInterviewFlow
      progress={progress}
      answers={answers}
      saveAnswer={saveAnswer}
      updateProgress={updateProgress}
      loading={interviewLoading}
    />
  );
};

export default Interview;
