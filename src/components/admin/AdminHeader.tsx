
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteCandidate } from "@/components/InviteCandidate";
import { AddCandidateManually } from "@/components/AddCandidateManually";
import { Users, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onCandidateAdded?: () => void;
}

export const AdminHeader = ({ onCandidateAdded }: AdminHeaderProps) => {
  const { profile } = useAuth();

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <span>Admin Dashboard</span>
            </CardTitle>
            <CardDescription className="text-lg">
              Welcome back, {profile?.full_name || 'Admin'}! Manage candidates and interview progress.
            </CardDescription>
          </div>
          <div className="flex items-center space-x-3">
            <AddCandidateManually onCandidateAdded={onCandidateAdded} />
            <InviteCandidate />
            <Link to="/admin/settings">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
