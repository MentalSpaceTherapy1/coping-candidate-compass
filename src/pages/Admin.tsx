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
      
      // First, let's check all profiles to see what we have
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('*');

      console.log('All profiles in database:', allProfiles);
      console.log('All profiles error:', allProfilesError);

      // Now fetch only candidates
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at,
          role,
          interview_progress (
            submission_status,
            submitted_at,
            current_step,
            completed_sections
          )
        `);

      console.log('Query for all profiles (no role filter):', profiles);
      console.log('Profile query error:', profilesError);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to fetch candidate data: " + profilesError.message,
          variant: "destructive"
        });
        return;
      }

      // Filter candidates in JavaScript if needed
      const candidateProfiles = (profiles || []).filter(profile => profile.role === 'candidate');
      console.log('Filtered candidate profiles:', candidateProfiles);

      // Also fetch all interview progress to see what's there
      const { data: allProgress, error: progressError } = await supabase
        .from('interview_progress')
        .select('*');

      console.log('All interview progress records:', allProgress);
      console.log('Progress error:', progressError);

      // Transform data to match the expected format
      const transformedCandidates: Candidate[] = candidateProfiles.map(profile => {
        const progress = Array.isArray(profile.interview_progress) 
          ? profile.interview_progress[0] 
          : profile.interview_progress;
        
        console.log(`Processing profile ${profile.full_name}:`, { profile, progress });
        
        return {
          id: profile.id,
          name: profile.full_name || 'Unknown',
          email: profile.email,
          submissionStatus: progress?.submission_status || 'draft',
          dateSubmitted: progress?.submitted_at || profile.created_at,
          overallScore: null, // We'll calculate this separately if needed
          sections: {
            general: null,
            technical: null,
            exercises: null,
            culture: null
          }
        };
      });

      console.log('Transformed candidates:', transformedCandidates);
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
