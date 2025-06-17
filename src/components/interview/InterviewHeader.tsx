
import { Badge } from "@/components/ui/badge";
import { Clock, Save, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { ProfileDropdown } from "@/components/ProfileDropdown";

interface InterviewHeaderProps {
  currentStep: number;
  totalSteps: number;
  estimatedTime: string;
  progressPercentage: number;
  lastSaved: Date | null;
}

const InterviewHeader = ({ 
  currentStep, 
  totalSteps, 
  estimatedTime, 
  progressPercentage, 
  lastSaved 
}: InterviewHeaderProps) => {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">MentalSpace Interview</h1>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            {lastSaved && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Save className="w-4 h-4" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{estimatedTime}</span>
            </Badge>
            <ProfileDropdown />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>
    </header>
  );
};

export default InterviewHeader;
