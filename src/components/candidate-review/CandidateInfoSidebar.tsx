
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, LinkedinIcon, Calendar, Star } from "lucide-react";

interface CandidateInfoSidebarProps {
  candidate: {
    name: string;
    email: string;
    phone: string | null;
    linkedin: string | null;
    submissionStatus: string;
    dateSubmitted: string;
    overallScore: number | null;
  };
}

const CandidateInfoSidebar = ({ candidate }: CandidateInfoSidebarProps) => {
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

  return (
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
  );
};

export default CandidateInfoSidebar;
