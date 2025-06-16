
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Link as LinkIcon } from "lucide-react";

interface TechnicalScenariosProps {
  data: any;
  onDataChange: (stepName: string, data: any) => void;
}

const TechnicalScenarios = ({ data, onDataChange }: TechnicalScenariosProps) => {
  const [answers, setAnswers] = useState(data.technicalScenarios || {});

  const scenarios = [
    {
      id: "multitenancy",
      question: "How would you structure a new web application for multi-tenancy (multiple providers/clinics under one platform) with secure data partitioning?",
      required: true,
      supportsFiles: true
    },
    {
      id: "userExperience",
      question: "Given that our clients are mental health professionals and clients who may have limited tech skills, how would you design onboarding and user support features?",
      required: true,
      supportsFiles: true
    },
    {
      id: "apiIntegration",
      question: "Describe your process for integrating third-party scheduling and billing APIs into a custom EHR or client portal.",
      required: true,
      supportsFiles: true
    },
    {
      id: "rbac",
      question: "What is your approach for implementing role-based access control (RBAC) in an application where therapists, clients, administrators, and billers need different permissions?",
      required: true,
      supportsFiles: true
    },
    {
      id: "notifications",
      question: "How do you handle push notifications and real-time messaging securely in a mental health app context?",
      required: true,
      supportsFiles: true
    }
  ];

  useEffect(() => {
    onDataChange("technicalScenarios", answers);
  }, [answers, onDataChange]);

  const handleAnswerChange = (scenarioId: string, field: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [scenarioId]: {
        ...prev[scenarioId],
        [field]: value
      }
    }));
  };

  const handleFileUpload = (scenarioId: string, file: File) => {
    setAnswers(prev => ({
      ...prev,
      [scenarioId]: {
        ...prev[scenarioId],
        file: file,
        fileName: file.name
      }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Technical & Scenario Questions
            <Badge variant="outline">All Required</Badge>
          </CardTitle>
          <p className="text-gray-600">
            These questions focus on problem-solving and architectural thinking. 
            You can optionally upload diagrams, code snippets, or other supporting files.
          </p>
        </CardHeader>
      </Card>

      {scenarios.map((scenario, index) => (
        <Card key={scenario.id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <Label className="text-base font-medium leading-relaxed">
                  {index + 1}. {scenario.question}
                </Label>
                <Badge variant="destructive" className="ml-4 flex-shrink-0">
                  Required
                </Badge>
              </div>
              
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe your approach, architecture decisions, and implementation strategy..."
                  value={answers[scenario.id]?.answer || ""}
                  onChange={(e) => handleAnswerChange(scenario.id, "answer", e.target.value)}
                  className="min-h-[150px] resize-y"
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Supporting Files (Optional)
                    </Label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 transition-colors">
                      <input
                        type="file"
                        id={`file-${scenario.id}`}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.md"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(scenario.id, file);
                        }}
                      />
                      <label htmlFor={`file-${scenario.id}`} className="cursor-pointer">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {answers[scenario.id]?.fileName || "Upload diagram or document"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PDF, DOC, Images, Text files
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* External Link */}
                  <div>
                    <Label htmlFor={`link-${scenario.id}`} className="text-sm font-medium mb-2 block">
                      External Link (Optional)
                    </Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id={`link-${scenario.id}`}
                        type="url"
                        placeholder="Link to diagram, repository, etc."
                        value={answers[scenario.id]?.link || ""}
                        onChange={(e) => handleAnswerChange(scenario.id, "link", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  Answer length: {answers[scenario.id]?.answer?.length || 0} characters
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-medium text-green-900 mb-2">Scenario Question Tips</h4>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Think about real-world constraints and trade-offs</li>
                <li>• Consider security, scalability, and maintainability</li>
                <li>• Mention specific technologies and why you'd choose them</li>
                <li>• Include potential challenges and how you'd address them</li>
                <li>• Draw diagrams or create mockups if they help explain your approach</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalScenarios;
