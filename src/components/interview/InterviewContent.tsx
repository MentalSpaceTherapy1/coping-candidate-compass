
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface Step {
  id: number;
  title: string;
  estimatedTime: string;
  component: React.ComponentType<any>;
}

interface InterviewContentProps {
  currentStepData: Step;
  currentStep: number;
  totalSteps: number;
  answers: any;
  onDataChange: (stepName: string, data: any) => void;
}

const InterviewContent = ({ 
  currentStepData, 
  currentStep, 
  totalSteps, 
  answers, 
  onDataChange 
}: InterviewContentProps) => {
  const CurrentStepComponent = currentStepData.component;

  return (
    <div className="flex-1">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-2">
                <Clock className="w-4 h-4" />
                <span>Estimated time: {currentStepData.estimatedTime}</span>
              </CardDescription>
            </div>
            <Badge variant="secondary">
              Step {currentStep} of {totalSteps}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Dynamic Step Content */}
      <CurrentStepComponent
        data={answers}
        onDataChange={onDataChange}
      />
    </div>
  );
};

export default InterviewContent;
