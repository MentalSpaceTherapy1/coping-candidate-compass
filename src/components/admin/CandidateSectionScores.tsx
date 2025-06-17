
interface CandidateSectionScoresProps {
  sections: {
    general: number | null;
    technical: number | null;
    exercises: number | null;
    culture: number | null;
  };
}

export const CandidateSectionScores = ({ sections }: CandidateSectionScoresProps) => {
  return (
    <div className="flex space-x-2">
      {Object.entries(sections).map(([key, score]) => (
        <div key={key} className="text-xs">
          <div className="font-medium capitalize">{key.substring(0, 3)}</div>
          <div className="text-gray-500">
            {score ? score.toFixed(1) : '-'}
          </div>
        </div>
      ))}
    </div>
  );
};
