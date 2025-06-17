
import { useState, useEffect } from "react";
import { useInterviewData } from "@/hooks/useInterviewData";
import GeneralQuestions from "@/components/interview/GeneralQuestions";
import TechnicalScenarios from "@/components/interview/TechnicalScenarios";
import TechnicalExercises from "@/components/interview/TechnicalExercises";
import CultureFit from "@/components/interview/CultureFit";
import ReviewSubmit from "@/components/interview/ReviewSubmit";
import InterviewHeader from "@/components/interview/InterviewHeader";
import InterviewSidebar from "@/components/interview/InterviewSidebar";
import InterviewContent from "@/components/interview/InterviewContent";
import InterviewNavigation from "@/components/interview/InterviewNavigation";

const Interview = () => {
  const { progress, answers, saveAnswer, updateProgress, loading, lastSaved } = useInterviewData();
  const [currentStep, setCurrentStep] = useState(1);

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

  const handleStepData = async (stepName: string, data: any) => {
    // Save each answer individually with debouncing
    for (const [questionKey, value] of Object.entries(data)) {
      if (value && (typeof value === 'string' ? value.trim() : true)) {
        await saveAnswer(stepName, questionKey, value);
      }
    }
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

  if (!currentStepData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <InterviewHeader
        currentStep={currentStep}
        totalSteps={steps.length}
        estimatedTime={currentStepData.estimatedTime}
        progressPercentage={progressPercentage}
        lastSaved={lastSaved}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex gap-8">
          <InterviewSidebar
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />

          <InterviewContent
            currentStepData={currentStepData}
            currentStep={currentStep}
            totalSteps={steps.length}
            answers={answers}
            onDataChange={handleStepData}
          />
        </div>

        <InterviewNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
    </div>
  );
};

export default Interview;
