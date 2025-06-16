import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { CandidateTable } from "@/components/admin/CandidateTable";
import { EmptyState } from "@/components/admin/EmptyState";

interface Candidate {
  id: string;
  name: string;
  email: string;
  submissionStatus: string;
  dateSubmitted: string;
  overallScore: number | null;
  sections: {
    general: number | null;
    technical: number | null;
    exercises: number | null;
    culture: number | null;
  };
}

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching candidates...');
      
      // First, get all interview progress records
      const { data: allProgress, error: progressError } = await supabase
        .from('interview_progress')
        .select('*');

      console.log('All interview progress records:', allProgress);

      if (progressError) {
        console.error('Error fetching progress:', progressError);
      }

      // Now get all profiles
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      console.log('All profiles:', allProfiles);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to fetch profiles: " + profilesError.message,
          variant: "destructive"
        });
        return;
      }

      // Create candidates from interview progress data
      const transformedCandidates: Candidate[] = [];

      // Process interview progress records
      if (allProgress) {
        for (const progress of allProgress) {
          // Find corresponding profile
          const profile = allProfiles?.find(p => p.id === progress.user_id);
          
          console.log(`Processing progress for user ${progress.user_id}:`, { progress, profile });
          
          if (profile) {
            // Only include if user has candidate role OR if they have interview progress (they might be a candidate without proper role)
            transformedCandidates.push({
              id: profile.id,
              name: profile.full_name || 'Unknown',
              email: profile.email,
              submissionStatus: progress.submission_status || 'draft',
              dateSubmitted: progress.submitted_at || progress.created_at,
              overallScore: null,
              sections: {
                general: null,
                technical: null,
                exercises: null,
                culture: null
              }
            });
          } else {
            // Progress without profile - this indicates orphaned data
            console.warn(`Found interview progress for user ${progress.user_id} but no corresponding profile`);
            
            // Create a placeholder candidate entry
            transformedCandidates.push({
              id: progress.user_id,
              name: 'Unknown User (No Profile)',
              email: 'unknown@email.com',
              submissionStatus: progress.submission_status || 'draft',
              dateSubmitted: progress.submitted_at || progress.created_at,
              overallScore: null,
              sections: {
                general: null,
                technical: null,
                exercises: null,
                culture: null
              }
            });
          }
        }
      }

      // Also check for candidate profiles without interview progress
      if (allProfiles) {
        const candidateProfiles = allProfiles.filter(p => p.role === 'candidate');
        for (const profile of candidateProfiles) {
          // Only add if not already added from progress
          if (!transformedCandidates.find(c => c.id === profile.id)) {
            transformedCandidates.push({
              id: profile.id,
              name: profile.full_name || 'Unknown',
              email: profile.email,
              submissionStatus: 'not-started',
              dateSubmitted: profile.created_at,
              overallScore: null,
              sections: {
                general: null,
                technical: null,
                exercises: null,
                culture: null
              }
            });
          }
        }
      }

      console.log('Final transformed candidates:', transformedCandidates);
      setCandidates(transformedCandidates);
    } catch (error) {
      console.error('Error in fetchCandidates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch candidate data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || candidate.submissionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completedCount = candidates.filter(c => c.submissionStatus === "completed").length;
  const inProgressCount = candidates.filter(c => c.submissionStatus === "in-progress").length;

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
          totalCandidates={candidates.length}
          completedCount={completedCount}
          inProgressCount={inProgressCount}
        />

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
