
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface GeneralQuestionsProps {
  data: any;
  onDataChange: (stepName: string, data: any) => void;
}

const GeneralQuestions = ({ data, onDataChange }: GeneralQuestionsProps) => {
  const [answers, setAnswers] = useState(data.generalQuestions || {});

  const questions = [
    {
      id: "experience",
      question: "Tell us about your experience developing web and mobile applications. Which frameworks and languages do you specialize in?",
      required: true
    },
    {
      id: "healthcare",
      question: "Have you worked with healthcare or mental health platforms before? If so, describe your role and the scope of your contributions.",
      required: true
    },
    {
      id: "security",
      question: "Describe your experience developing secure, HIPAA-compliant web applications. What steps do you take to ensure data privacy and security?",
      required: true
    },
    {
      id: "ehr",
      question: "Have you developed or contributed to Electronic Health Record (EHR) systems before? What were the core features you implemented?",
      required: true
    },
    {
      id: "scalability",
      question: "How do you approach building scalable and maintainable codebases for large applications that evolve over time?",
      required: true
    },
    {
      id: "mobile",
      question: "What is your experience with mobile app development for both iOS and Android (native or cross-platform)? Which tools do you prefer and why?",
      required: true
    },
    {
      id: "apis",
      question: "Describe your experience with API integrations (for example, billing systems like AdvancedMD, telehealth/video platforms, secure messaging).",
      required: true
    },
    {
      id: "agile",
      question: "Can you discuss your experience working in Agile or other collaborative development environments?",
      required: true
    },
    {
      id: "uiux",
      question: "What strategies do you use to ensure responsive, accessible, and user-friendly UI/UX, especially for diverse populations?",
      required: true
    },
    {
      id: "cloud",
      question: "Have you worked with any cloud platforms (AWS, Azure, Google Cloud) or serverless architectures? If yes, please elaborate.",
      required: true
    }
  ];

  useEffect(() => {
    onDataChange("generalQuestions", answers);
  }, [answers, onDataChange]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const getAnswerLength = (questionId: string) => {
    return answers[questionId]?.length || 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            General Questions
            <Badge variant="outline">All Required</Badge>
          </CardTitle>
          <p className="text-gray-600">
            Please provide detailed answers about your experience and background. 
            These questions help us understand your technical expertise and relevant experience.
          </p>
        </CardHeader>
      </Card>

      {questions.map((q, index) => (
        <Card key={q.id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <Label className="text-base font-medium leading-relaxed">
                  {index + 1}. {q.question}
                </Label>
                <Badge variant={q.required ? "destructive" : "secondary"} className="ml-4 flex-shrink-0">
                  {q.required ? "Required" : "Optional"}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Textarea
                  placeholder="Please provide a detailed answer..."
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  className="min-h-[120px] resize-y"
                  required={q.required}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{getAnswerLength(q.id)} characters</span>
                  <span>Minimum recommended: 200 characters</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Tips for Great Answers</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Be specific about technologies, frameworks, and tools you've used</li>
                <li>• Include examples of projects or challenges you've worked on</li>
                <li>• Mention any certifications or training related to healthcare/security</li>
                <li>• Quantify your experience where possible (years, team size, project scale)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralQuestions;
