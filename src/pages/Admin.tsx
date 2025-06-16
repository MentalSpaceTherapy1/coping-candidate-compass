import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, Filter, Download, Eye, Star, Calendar, User } from "lucide-react";
import { Link } from "react-router-dom";
import { InviteCandidate } from "@/components/InviteCandidate";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      
      // Fetch profiles with interview progress using the proper join now that FK is established
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at,
          interview_progress (
            submission_status,
            submitted_at,
            current_step,
            completed_sections
          )
        `)
        .eq('role', 'candidate');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to fetch candidate data",
          variant: "destructive"
        });
        return;
      }

      console.log('Fetched profiles:', profiles);

      // Transform data to match the expected format
      const transformedCandidates: Candidate[] = (profiles || []).map(profile => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getScoreDisplay = (score: number | null) => {
    if (score === null) return <span className="text-gray-400">-</span>;
    return (
      <div className="flex items-center space-x-1">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="font-medium">{score.toFixed(1)}</span>
      </div>
    );
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
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/ff59cade-15f3-4d94-80a2-7c1383242387.png" 
                  alt="MentalSpace Logo" 
                  className="h-8 w-auto"
                />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">Interview Management</p>
                </div>
              </Link>
            </div>
          </div>
        </header>
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
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/ff59cade-15f3-4d94-80a2-7c1383242387.png" 
                alt="MentalSpace Logo" 
                className="h-8 w-auto"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Interview Management</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <InviteCandidate />
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{candidates.length}</div>
                  <p className="text-sm text-gray-600">Total Candidates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{completedCount}</div>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-sm text-gray-600">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{inProgressCount}</div>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Candidate Management</CardTitle>
            <CardDescription>Review and manage interview submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search candidates by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="score">Sort by Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Candidates Table */}
        <Card>
          <CardContent className="pt-6">
            {candidates.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates yet</h3>
                <p className="text-gray-600 mb-4">Invite candidates to start seeing them here.</p>
                <InviteCandidate />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Overall Score</TableHead>
                    <TableHead>Section Scores</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{candidate.name}</div>
                          <div className="text-sm text-gray-500">{candidate.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(candidate.submissionStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(candidate.dateSubmitted).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getScoreDisplay(candidate.overallScore)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {Object.entries(candidate.sections).map(([key, score]) => (
                            <div key={key} className="text-xs">
                              <div className="font-medium capitalize">{key.substring(0, 3)}</div>
                              <div className="text-gray-500">
                                {score ? score.toFixed(1) : '-'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link to={`/admin/candidate/${candidate.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
