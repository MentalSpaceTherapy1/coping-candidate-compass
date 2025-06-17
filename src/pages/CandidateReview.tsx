
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, Calendar, User, Mail, Phone, LinkedinIcon, Download } from "lucide-react";
import { useCandidateDetails } from "@/hooks/useCandidateDetails";

const CandidateReview = () => {
  const { candidateId } = useParams();
  const { candidate, loading, error } = useCandidateDetails(candidateId || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="font-medium mb-2">Loading Candidate Details</h3>
              <p className="text-sm text-gray-500">Please wait while we fetch the candidate information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-medium mb-2">
                {error || "Candidate Not Found"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {error || "The candidate you're looking for doesn't exist or hasn't started the interview yet."}
              </p>
              <Link to="/admin">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
    if (score === null) return <span className="text-gray-400">Not scored</span>;
    return (
      <div className="flex items-center space-x-1">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="font-medium">{score.toFixed(1)}</span>
      </div>
    );
  };

  const handleExport = () => {
    const exportData = {
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      linkedin: candidate.linkedin,
      status: candidate.submissionStatus,
      dateSubmitted: candidate.dateSubmitted,
      overallScore: candidate.overallScore,
      sections: candidate.sections
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `candidate-${candidate.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Candidate Review</h1>
                <p className="text-sm text-gray-600">{candidate.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Candidate Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Candidate Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">{candidate.name}</h3>
                  <div className="mt-2">{getStatusBadge(candidate.submissionStatus)}</div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                  {candidate.linkedin && (
                    <div className="flex items-center space-x-2 text-sm">
                      <LinkedinIcon className="w-4 h-4 text-gray-500" />
                      <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Submitted: {new Date(candidate.dateSubmitted).toLocaleDateString()}</span>
                  </div>
                </div>

                {candidate.overallScore && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Overall Score</h4>
                      <div className="flex items-center space-x-2">
                        {getScoreDisplay(candidate.overallScore)}
                        <span className="text-sm text-gray-500">/ 5.0</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Interview Sections */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {Object.entries(candidate.sections).map(([sectionKey, sectionData]) => (
                <Card key={sectionKey}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{sectionKey} Questions</CardTitle>
                      {getScoreDisplay(sectionData.score)}
                    </div>
                    <CardDescription>
                      {sectionKey === 'general' && 'Basic information and background questions'}
                      {sectionKey === 'technical' && 'Technical skills and experience assessment'}
                      {sectionKey === 'exercises' && 'Practical coding and problem-solving exercises'}
                      {sectionKey === 'culture' && 'Cultural fit and team dynamics evaluation'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sectionData.answers.length > 0 ? (
                      <div className="space-y-3">
                        {sectionData.answers.map((answer, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-600 mb-1">Response {index + 1}:</p>
                            <p className="text-gray-800">{answer}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No responses submitted yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateReview;
