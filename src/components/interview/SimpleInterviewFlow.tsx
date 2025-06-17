
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import GeneralQuestions from "./GeneralQuestions";
import TechnicalScenarios from "./TechnicalScenarios";
import TechnicalExercises from "./TechnicalExercises";
import CultureFit from "./CultureFit";
import ReviewSubmit from "./ReviewSubmit";

interface SimpleInterviewFlowProps {
  progress: any;
  answers: Record<string, any>;
  saveAnswer: (section: string, questionKey: string, value: any) => Promise<void>;
  updateProgress: (step: number, completedSections?: any) => Promise<void>;
  loading: boolean;
}

const steps = [
  { id: 1, title: "General Questions", component: GeneralQuestions, section: "general" },
  { id: 2, title: "Technical Scenarios", component: TechnicalScenarios, section: "technicalScenarios" },
  { id: 3, title: "Technical Exercises", component: TechnicalExercises, section: "technicalExercises" },
  { id: 4, title: "Culture & Team Fit", component: CultureFit, section: "cultureFit" },
  { id: 5, title: "Review & Submit", component: ReviewSubmit, section: "review" }
];

const SimpleInterviewFlow = ({ 
  progress, 
  answers, 
  saveAnswer, 
  updateProgress, 
  loading 
}: SimpleInterviewFlowProps) => {
  const [currentStep, setCurrentStep] = useState(progress?.current_step || 1);
  const currentStepData = steps.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component;

  const handleDataChange = (stepName: string, data: any) => {
    // Save each field in the data object
    Object.entries(data).forEach(([key, value]) => {
      saveAnswer(stepName, key, value);
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      updateProgress(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateProgress(prevStep);
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <h3 className="font-medium">Loading Interview...</h3>
                <p className="text-sm text-gray-500">Please wait while we prepare your interview.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Progress Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-2xl">Developer Interview</CardTitle>
                <p className="text-gray-600 mt-1">
                  Step {currentStep} of {steps.length}: {currentStepData?.title}
                </p>
              </div>
              <Badge variant="secondary">
                {Math.round(progressPercentage)}% Complete
              </Badge>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </CardHeader>
        </Card>

        {/* Current Step Content */}
        {CurrentStepComponent && (
          <CurrentStepComponent
            data={answers}
            onDataChange={handleDataChange}
          />
        )}

        {/* Navigation */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex space-x-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`w-3 h-3 rounded-full ${
                      step.id === currentStep
                        ? 'bg-blue-500'
                        : step.id < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                disabled={currentStep === steps.length}
              >
                {currentStep === steps.length ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleInterviewFlow;
