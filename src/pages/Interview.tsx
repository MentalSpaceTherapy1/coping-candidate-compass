
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ExternalLink, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import InterviewContent from "@/components/interview/InterviewContent";
import { useInterviewData } from "@/hooks/useInterviewData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Interview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [validatingToken, setValidatingToken] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  const token = searchParams.get('token');

  // Only load interview data if user is authenticated
  const { 
    loading: interviewLoading, 
    progress, 
    answers, 
    saveAnswer, 
    updateProgress 
  } = useInterviewData();

  // Validate invitation token if present
  useEffect(() => {
    const validateInvitationToken = async () => {
      if (!token) return;
      
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

        setTokenValidated(true);
        console.log('✅ Valid invitation token for:', invitation.candidate_email);
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
    };

    validateInvitationToken();
  }, [token, toast, navigate]);

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
                  {validatingToken ? 'Validating invitation...' : 'Checking authentication...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is not authenticated, show account creation prompt
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {token ? 'Welcome to Your Interview' : 'Interview Access Required'}
              </CardTitle>
              <CardDescription>
                {token 
                  ? 'To begin your interview, please create an account or sign in.'
                  : 'You need an invitation to access the interview portal.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {token && tokenValidated && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Valid Invitation Confirmed</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Your invitation has been verified. Create an account to begin.
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <Button
                  onClick={() => navigate(token ? `/register?token=${token}` : '/register')}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  size="lg"
                >
                  Create Account
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate(token ? `/login?token=${token}` : '/login')}
                  className="w-full"
                  size="lg"
                >
                  Sign In
                </Button>
              </div>

              {!token && (
                <div className="pt-4 text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Don't have an invitation?
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Learn More About MentalSpace
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // User is authenticated - show interview content
  // Pass the correct props that InterviewContent expects
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Simple interview placeholder for now - need to implement proper step navigation */}
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Interview Portal</CardTitle>
            <CardDescription>Complete your interview assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Welcome to the interview portal. The interview components will be integrated here.
            </p>
            {progress && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Current step: {progress.current_step || 1}
                </p>
                <p className="text-sm text-blue-800">
                  Status: {progress.submission_status || 'draft'}
                </p>
              </div>
            )}
            {Object.keys(answers).length > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  You have {Object.keys(answers).reduce((count, section) => count + Object.keys(answers[section] || {}).length, 0)} saved answers
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Interview;
