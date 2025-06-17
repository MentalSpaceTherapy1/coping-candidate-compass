
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface SectionCardProps {
  sectionKey: string;
  sectionData: {
    score: number | null;
    answers: string[];
  };
}

const SectionCard = ({ sectionKey, sectionData }: SectionCardProps) => {
  const getScoreDisplay = (score: number | null) => {
    if (score === null) return <span className="text-gray-400">Not scored</span>;
    return (
      <div className="flex items-center space-x-1">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="font-medium">{score.toFixed(1)}</span>
      </div>
    );
  };

  const getSectionDescription = (section: string) => {
    switch (section) {
      case 'general':
        return 'Basic information and background questions';
      case 'technical':
        return 'Technical skills and experience assessment';
      case 'exercises':
        return 'Practical coding and problem-solving exercises';
      case 'culture':
        return 'Cultural fit and team dynamics evaluation';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="capitalize">{sectionKey} Questions</CardTitle>
          {getScoreDisplay(sectionData.score)}
        </div>
        <CardDescription>
          {getSectionDescription(sectionKey)}
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
  );
};

export default SectionCard;
