
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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

interface ExportButtonProps {
  candidate: Candidate;
}

export const ExportButton = ({ candidate }: ExportButtonProps) => {
  const canExport = (candidate: Candidate) => {
    return candidate.submissionStatus === 'completed' || candidate.submissionStatus === 'in-progress';
  };

  const handleExport = (candidate: Candidate) => {
    if (!canExport(candidate)) return;
    
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
    <Button 
      size="sm" 
      variant="outline" 
      disabled={!canExport(candidate)}
      onClick={() => handleExport(candidate)}
    >
      <Download className="w-4 h-4 mr-1" />
      Export
    </Button>
  );
};
