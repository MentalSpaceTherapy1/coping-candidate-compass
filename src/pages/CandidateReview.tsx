
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCandidateDetails } from "@/hooks/useCandidateDetails";
import CandidateHeader from "@/components/candidate-review/CandidateHeader";
import CandidateInfoSidebar from "@/components/candidate-review/CandidateInfoSidebar";
import InterviewSections from "@/components/candidate-review/InterviewSections";

const CandidateReview = () => {
  const { candidateId } = useParams();
  const { candidate, loading, error } = useCandidateDetails(candidateId || '');

  const handleExport = () => {
    if (!candidate) return;
    
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <CandidateHeader 
        candidateName={candidate.name} 
        onExport={handleExport} 
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CandidateInfoSidebar candidate={candidate} />
          </div>

          <div className="lg:col-span-2">
            <InterviewSections sections={candidate.sections} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateReview;
