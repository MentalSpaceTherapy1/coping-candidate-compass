
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, Clock, ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useInterviewData } from "@/hooks/useInterviewData";
import GeneralQuestions from "@/components/interview/GeneralQuestions";
import TechnicalScenarios from "@/components/interview/TechnicalScenarios";
import TechnicalExercises from "@/components/interview/TechnicalExercises";
import CultureFit from "@/components/interview/CultureFit";
import ReviewSubmit from "@/components/interview/ReviewSubmit";

const Interview = () => {
  const { progress, answers, saveAnswer, updateProgress, loading } = useInterviewData();
  const [currentStep, setCurrentStep] = useState(1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  const steps = [
    { id: 1, title: "General Questions", component: GeneralQuestions, estimatedTime: "15 min" },
    { id: 2, title: "Technical Scenarios", component: TechnicalScenarios, estimatedTime: "20 min" },
    { id: 3, title: "Technical Exercises", component: TechnicalExercises, estimatedTime: "2-4 hours" },
    { id: 4, title: "Culture & Team Fit", component: CultureFit, estimatedTime: "10 min" },
    { id: 5, title: "Review & Submit", component: ReviewSubmit, estimatedTime: "5 min" }
  ];

  // Initialize current step from progress data
  useEffect(() => {
    if (progress?.current_step) {
      setCurrentStep(progress.current_step);
    }
  }, [progress]);

  const currentStepData = steps.find(step => step.id === currentStep);
  const progressPercentage = (currentStep / steps.length) * 100;

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSaved(new Date());
      console.log("Auto-save triggered...");
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleStepData = async (stepName: string, data: any) => {
    // Save each answer individually
    for (const [questionKey, value] of Object.entries(data)) {
      if (value && (typeof value === 'string' ? value.trim() : true)) {
        await saveAnswer(stepName, questionKey, value);
      }
    }
    
    setLastSaved(new Date());
    toast({
      title: "Progress saved",
      description: "Your answers have been automatically saved.",
    });
  };

  const handleNext = async () => {
    if (currentStep < steps.length) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      await updateProgress(newStep);
    }
  };

  const handlePrevious = async () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      await updateProgress(newStep);
    }
  };

  const handleStepClick = async (stepId: number) => {
    setCurrentStep(stepId);
    await updateProgress(stepId);
  };

  const CurrentStepComponent = currentStepData?.component;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
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
                <span>{currentStepData?.estimatedTime}</span>
              </Badge>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm text-gray-500">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
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
                    onClick={() => handleStepClick(step.id)}
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

          {/* Main Content */}
          <div className="flex-1">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{currentStepData?.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-2 mt-2">
                      <Clock className="w-4 h-4" />
                      <span>Estimated time: {currentStepData?.estimatedTime}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    Step {currentStep} of {steps.length}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Dynamic Step Content */}
            {CurrentStepComponent && (
              <CurrentStepComponent
                data={answers}
                onDataChange={handleStepData}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={currentStep === steps.length}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;
