
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Download, Star, Mail } from "lucide-react";
import { Link } from "react-router-dom";

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

interface CandidateTableProps {
  candidates: Candidate[];
}

export const CandidateTable = ({ candidates }: CandidateTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Draft</Badge>;
      case "invited":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
          <Mail className="w-3 h-3 mr-1" />
          Invited
        </Badge>;
      case "not-started":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Not Started</Badge>;
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

  const canExport = (candidate: Candidate) => {
    // Can only export if there's actual submission data
    return candidate.submissionStatus === 'completed' || candidate.submissionStatus === 'in-progress';
  };

  const handleExport = (candidate: Candidate) => {
    if (!canExport(candidate)) return;
    
    // Create a simple text export of the candidate's information
    const exportData = {
      name: candidate.name,
      email: candidate.email,
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Candidate</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Overall Score</TableHead>
          <TableHead>Section Scores</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate) => (
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
                <div>{new Date(candidate.dateSubmitted).toLocaleDateString()}</div>
                <div className="text-xs text-gray-500">
                  {candidate.submissionStatus === 'invited' ? 'Invited' : 'Submitted'}
                </div>
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
                <Button 
                  size="sm" 
                  variant="outline" 
                  disabled={!canExport(candidate)}
                  onClick={() => handleExport(candidate)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
