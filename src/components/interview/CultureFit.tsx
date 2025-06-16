
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";

interface CultureFitProps {
  data: any;
  onDataChange: (stepName: string, data: any) => void;
}

const CultureFit = ({ data, onDataChange }: CultureFitProps) => {
  const [answers, setAnswers] = useState(data.cultureQuestions || {});

  const questions = [
    {
      id: "motivation",
      question: "Why are you interested in working in the mental health/telehealth industry?",
      required: true
    },
    {
      id: "feedback",
      question: "How do you handle feedback or requirements changes in the middle of a sprint?",
      required: true
    },
    {
      id: "pressure",
      question: "Describe a time you had to deliver under a tight deadline or handle production bugs. How did you manage it?",
      required: true
    }
  ];

  useEffect(() => {
    if (data.cultureQuestions) {
      setAnswers(data.cultureQuestions);
    }
  }, [data.cultureQuestions]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onDataChange("cultureQuestions", answers);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [answers, onDataChange]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Heart className="w-6 h-6 text-pink-600" />
            <span>Culture & Team Fit</span>
            <Badge variant="outline">All Required</Badge>
          </CardTitle>
          <p className="text-gray-600">
            These questions help us understand your motivations, work style, and how you handle 
            challenges. We value empathy, resilience, and collaborative problem-solving.
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
                <Badge variant="destructive" className="ml-4 flex-shrink-0">
                  Required
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Textarea
                  placeholder="Share your thoughts and experiences..."
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  className="min-h-[120px] resize-y"
                  required={q.required}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{answers[q.id]?.length || 0} characters</span>
                  <span>Be specific and provide examples</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Heart className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">What We Value</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800 text-sm">
                <div>
                  <h5 className="font-medium mb-1">Personal Qualities:</h5>
                  <ul className="space-y-1">
                    <li>• Empathy and compassion</li>
                    <li>• Strong communication skills</li>
                    <li>• Adaptability and growth mindset</li>
                    <li>• Attention to detail</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-1">Work Style:</h5>
                  <ul className="space-y-1">
                    <li>• Collaborative team player</li>
                    <li>• Problem-solving orientation</li>
                    <li>• Commitment to quality</li>
                    <li>• Respect for privacy and ethics</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h4 className="font-medium text-gray-900 mb-2">Our Mission</h4>
            <p className="text-gray-700 italic">
              "To make mental healthcare more accessible, effective, and compassionate through innovative technology solutions that empower both providers and clients."
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CultureFit;
