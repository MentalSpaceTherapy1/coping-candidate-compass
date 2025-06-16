import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, Clock, FileText, Code, Users, Heart } from "lucide-react";

interface ReviewSubmitProps {
  data: any;
  onDataChange: (stepName: string, data: any) => void;
}

const ReviewSubmit = ({ data }: ReviewSubmitProps) => {
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const sections = [
    {
      id: "generalQuestions",
      title: "General Questions",
      icon: FileText,
      data: data.generalQuestions || {},
      required: 10,
      description: "Background and experience questions"
    },
    {
      id: "technicalScenarios",
      title: "Technical Scenarios",
      icon: AlertCircle,
      data: data.technicalScenarios || {},
      required: 5,
      description: "Problem-solving and architecture questions"
    },
    {
      id: "technicalExercises",
      title: "Technical Exercises",
      icon: Code,
      data: data.technicalExercises || {},
      required: 5,
      description: "Hands-on coding projects"
    },
    {
      id: "cultureQuestions",
      title: "Culture & Team Fit",
      icon: Heart,
      data: data.cultureQuestions || {},
      required: 3,
      description: "Motivation and work style questions"
    }
  ];

  const getCompletionStatus = (sectionData: any, required: number) => {
    const answered = Object.keys(sectionData).filter(key => 
      sectionData[key] && 
      (typeof sectionData[key] === 'string' ? sectionData[key].trim() : true)
    ).length;
    return { answered, required, percentage: (answered / required) * 100 };
  };

  const getTotalCompletion = () => {
    const totals = sections.reduce((acc, section) => {
      const status = getCompletionStatus(section.data, section.required);
      acc.answered += status.answered;
      acc.required += status.required;
      return acc;
    }, { answered: 0, required: 0 });
    
    return (totals.answered / totals.required) * 100;
  };

  const isReadyToSubmit = getTotalCompletion() >= 80; // At least 80% complete

  const handleSubmit = async () => {
    if (!confirmed) {
      toast({
        title: "Confirmation required",
        description: "Please confirm that you want to submit your interview.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      toast({
        title: "Interview submitted successfully!",
        description: "Thank you for completing the interview. We'll be in touch soon.",
      });
      navigate("/thank-you");
      setIsSubmitting(false);
    }, 2000);
  };

  const handleConfirmationChange = (checked: boolean | "indeterminate") => {
    if (typeof checked === "boolean") {
      setConfirmed(checked);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Review & Submit Interview
            <Badge variant={isReadyToSubmit ? "default" : "secondary"}>
              {Math.round(getTotalCompletion())}% Complete
            </Badge>
          </CardTitle>
          <p className="text-gray-600">
            Please review your answers before submitting. You can go back to any section to make changes.
          </p>
        </CardHeader>
      </Card>

      {/* Completion Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section) => {
          const status = getCompletionStatus(section.data, section.required);
          const IconComponent = section.icon;
          
          return (
            <Card key={section.id} className="text-center">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    status.percentage === 100 ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`w-6 h-6 ${
                      status.percentage === 100 ? 'text-green-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{section.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{section.description}</p>
                    <Badge variant={status.percentage === 100 ? "default" : "secondary"}>
                      {status.answered}/{status.required} answered
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Section Review */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Section Details</h3>
        
        {sections.map((section) => {
          const status = getCompletionStatus(section.data, section.required);
          const IconComponent = section.icon;
          
          return (
            <Card key={section.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium">{section.title}</h4>
                      <p className="text-sm text-gray-500">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={status.percentage === 100 ? "default" : "secondary"}>
                      {status.answered}/{status.required}
                    </Badge>
                    {status.percentage === 100 && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      status.percentage === 100 ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${status.percentage}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Submission Status */}
      <Card className={isReadyToSubmit ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            {isReadyToSubmit ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className={`font-medium mb-2 ${
                isReadyToSubmit ? 'text-green-900' : 'text-yellow-900'
              }`}>
                {isReadyToSubmit ? 'Ready to Submit!' : 'Almost Ready'}
              </h4>
              <p className={`text-sm ${
                isReadyToSubmit ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {isReadyToSubmit 
                  ? 'Your interview is complete and ready for submission.' 
                  : 'Please complete at least 80% of the required questions before submitting.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Confirmation */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="confirm" 
                checked={confirmed} 
                onCheckedChange={handleConfirmationChange}
                disabled={!isReadyToSubmit}
              />
              <label htmlFor="confirm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I confirm that I have reviewed my answers and am ready to submit my interview application to MentalSpace.
              </label>
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <p className="text-sm text-gray-600">
                Once submitted, you won't be able to make changes to your answers.
              </p>
              
              <Button
                onClick={handleSubmit}
                disabled={!confirmed || !isReadyToSubmit || isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                size="lg"
              >
                {isSubmitting ? "Submitting..." : "Submit Interview"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewSubmit;
