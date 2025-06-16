
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'candidate' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
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
                <p className="text-sm text-gray-500">Checking authentication status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && profile.role !== requiredRole) {
    // Redirect based on user role
    const redirectPath = profile.role === 'admin' ? '/admin' : '/interview';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
