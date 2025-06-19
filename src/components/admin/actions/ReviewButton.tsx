
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
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

interface ReviewButtonProps {
  candidate: Candidate;
}

export const ReviewButton = ({ candidate }: ReviewButtonProps) => {
  const canReview = (candidate: Candidate) => {
    return !candidate.id.startsWith('invitation-') && 
           (candidate.submissionStatus === 'completed' || 
            candidate.submissionStatus === 'in-progress' || 
            candidate.submissionStatus === 'draft');
  };

  if (canReview(candidate)) {
    return (
      <Link to={`/admin/candidate/${candidate.id}`}>
        <Button size="sm" variant="outline">
          <Eye className="w-4 h-4 mr-1" />
          Review
        </Button>
      </Link>
    );
  }

  return (
    <Button size="sm" variant="outline" disabled>
      <Eye className="w-4 h-4 mr-1" />
      {candidate.submissionStatus === 'invited' ? 'Awaiting Registration' : 'No Data'}
    </Button>
  );
};
