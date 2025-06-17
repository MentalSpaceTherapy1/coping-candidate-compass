
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface InterviewNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
}

const InterviewNavigation = ({ 
  currentStep, 
  totalSteps, 
  onPrevious, 
  onNext 
}: InterviewNavigationProps) => {
  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Previous</span>
      </Button>
      
      <Button
        onClick={onNext}
        disabled={currentStep === totalSteps}
        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
      >
        <span>Next</span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default InterviewNavigation;
