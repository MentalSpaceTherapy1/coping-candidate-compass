
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface Step {
  id: number;
  title: string;
  estimatedTime: string;
}

interface InterviewSidebarProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

const InterviewSidebar = ({ steps, currentStep, onStepClick }: InterviewSidebarProps) => {
  return (
    <div className="w-64 flex-shrink-0">
      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle className="text-lg">Interview Sections</CardTitle>
          <CardDescription>Click any section to navigate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                currentStep === step.id
                  ? 'bg-blue-100 border-2 border-blue-500 text-blue-700'
                  : 'hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === step.id
                    ? 'bg-blue-500 text-white'
                    : currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
                </div>
                <div>
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.estimatedTime}</div>
                </div>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewSidebar;
