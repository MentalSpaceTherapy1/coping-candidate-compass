
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (!token || type !== 'signup') {
        setStatus('error');
        setMessage('Invalid confirmation link. Please check your email and try again.');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          console.error('Email confirmation error:', error);
          setStatus('error');
          setMessage(error.message || 'Failed to confirm email. The link may have expired.');
        } else {
          setStatus('success');
          setMessage('Your email has been successfully confirmed! You can now sign in to your account.');
          
          toast({
            title: "Email Confirmed!",
            description: "Your account has been activated successfully.",
          });
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error) {
        console.error('Unexpected error during email confirmation:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again or contact support.');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate, toast]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-600" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Confirming Your Email...';
      case 'success':
        return 'Email Confirmed!';
      case 'error':
        return 'Confirmation Failed';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-900">MentalSpace</h1>
              <p className="text-sm text-gray-600">Therapy & Healing</p>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
            <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
            <CardDescription>
              {status === 'loading' && "Please wait while we verify your email address..."}
              {status === 'success' && "Welcome to MentalSpace! Your account is now active."}
              {status === 'error' && "There was an issue confirming your email address."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className={`mb-6 ${
              status === 'success' ? 'border-green-200 bg-green-50' : 
              status === 'error' ? 'border-red-200 bg-red-50' : 
              'border-blue-200 bg-blue-50'
            }`}>
              <AlertDescription className={
                status === 'success' ? 'text-green-800' : 
                status === 'error' ? 'text-red-800' : 
                'text-blue-800'
              }>
                {message}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {status === 'success' && (
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  Continue to Sign In
                </Button>
              )}
              
              {status === 'error' && (
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate('/register')}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  >
                    Try Signing Up Again
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailConfirmation;
