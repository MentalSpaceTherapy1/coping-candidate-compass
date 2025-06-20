
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, Star, Eye } from "lucide-react";

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

interface AdminStatsProps {
  candidates: Candidate[];
}

export const AdminStats = ({ candidates }: AdminStatsProps) => {
  const totalCandidates = candidates.length;
  const completedCount = candidates.filter(c => c.submissionStatus === 'completed').length;
  const inProgressCount = candidates.filter(c => c.submissionStatus === 'in-progress').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{totalCandidates}</div>
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
  );
};
