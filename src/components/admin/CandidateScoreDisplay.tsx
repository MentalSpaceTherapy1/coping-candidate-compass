
import { Star } from "lucide-react";

interface CandidateScoreDisplayProps {
  score: number | null;
}

export const CandidateScoreDisplay = ({ score }: CandidateScoreDisplayProps) => {
  if (score === null) return <span className="text-gray-400">-</span>;
  
  return (
    <div className="flex items-center space-x-1">
      <Star className="w-4 h-4 text-yellow-400 fill-current" />
      <span className="font-medium">{score.toFixed(1)}</span>
    </div>
  );
};
