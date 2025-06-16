
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { CandidateTable } from "@/components/admin/CandidateTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { useCandidates } from "@/hooks/useCandidates";
import { filterCandidates, getCandidateStats } from "@/utils/candidateFilters";
import { testAdminAccess } from "@/services/adminService";
import { useAuth } from "@/hooks/useAuth";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  
  const { candidates, loading, refetchCandidates } = useCandidates();
  const { user, profile } = useAuth();
  
  const filteredCandidates = filterCandidates(candidates, searchTerm, statusFilter);
  const stats = getCandidateStats(candidates);

  useEffect(() => {
    // Run admin access test when component mounts
    if (user && profile?.role === 'admin') {
      console.log('🔍 Running admin access test...');
      testAdminAccess();
    }
  }, [user, profile]);

  const handleTestAccess = async () => {
    console.log('🧪 Manual admin access test triggered');
    await testAdminAccess();
    refetchCandidates();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading candidate data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <AdminHeader />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <AdminStats 
          totalCandidates={stats.totalCandidates}
          completedCount={stats.completedCount}
          inProgressCount={stats.inProgressCount}
        />

        {/* Debug section - remove after fixing */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-orange-800">Debug Info</h3>
                <p className="text-sm text-orange-600">
                  User: {user?.email} | Role: {profile?.role} | Candidates found: {candidates.length}
                </p>
              </div>
              <Button onClick={handleTestAccess} variant="outline" size="sm">
                Test Access
              </Button>
            </div>
          </CardContent>
        </Card>

        <AdminFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <Card>
          <CardContent className="pt-6">
            {candidates.length === 0 ? (
              <EmptyState />
            ) : (
              <CandidateTable candidates={filteredCandidates} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
