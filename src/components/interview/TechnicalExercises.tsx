
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, Code, Video } from "lucide-react";

interface TechnicalExercisesProps {
  data: any;
  onDataChange: (stepName: string, data: any) => void;
}

const TechnicalExercises = ({ data, onDataChange }: TechnicalExercisesProps) => {
  const [answers, setAnswers] = useState(data.technicalExercises || {});

  const exercises = [
    {
      id: "auth",
      title: "Secure Login & Role-Based Access Control",
      description: "Build a basic authentication flow for a web or mobile app (any stack). Include login, logout, session management, and at least 3 roles: client, therapist, admin. Briefly explain how you would scale this for HIPAA compliance.",
      required: true
    },
    {
      id: "sessionNotes",
      title: "EHR \"Session Note\" Form",
      description: "Develop a dynamic form to capture session notes. Should support customizable templates (e.g., SOAP, DAP), file upload (PDF/image), and basic validation. Demonstrate how data is securely saved and how you'd prevent unauthorized access.",
      required: true
    },
    {
      id: "scheduling",
      title: "Appointment Scheduling Calendar with API Integration",
      description: "Integrate a simple appointment calendar with a mock or real API. Show create, view, edit, and cancel appointment features. Outline how you'd sync with Google Calendar or a third-party billing system.",
      required: true
    },
    {
      id: "messaging",
      title: "Real-Time Messaging or Telehealth Feature",
      description: "Create a basic real-time chat (or video call UI using a library like Twilio or WebRTC). Discuss how you'd ensure message privacy, logging, and compliance with healthcare regulations.",
      required: true
    },
    {
      id: "mobile",
      title: "Mobile App Prototype (Client-Facing)",
      description: "Build a minimal mobile app prototype (React Native, Flutter, or similar) that allows a client to register, schedule an appointment, securely message a therapist, and view past sessions/documents.",
      required: true
    },
    {
      id: "dashboard",
      title: "Reporting Dashboard (Bonus)",
      description: "Develop a basic reporting dashboard that pulls session/appointment data and visualizes: total sessions per therapist, no-shows/cancellations, revenue over time. Option to export (CSV/PDF) and filter.",
      required: false
    }
  ];

  useEffect(() => {
    onDataChange("technicalExercises", answers);
  }, [answers, onDataChange]);

  const handleAnswerChange = (exerciseId: string, field: string, value: string | File) => {
    setAnswers(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Technical Exercises
            <div className="flex space-x-2">
              <Badge variant="destructive">5 Required</Badge>
              <Badge variant="secondary">1 Bonus</Badge>
            </div>
          </CardTitle>
          <p className="text-gray-600">
            These hands-on exercises demonstrate your coding skills. You can submit code via file upload, 
            paste code directly, link to repositories, or submit video demonstrations.
          </p>
        </CardHeader>
      </Card>

      {exercises.map((exercise, index) => (
        <Card key={exercise.id} className={exercise.required ? "" : "border-orange-200 bg-orange-50"}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <span>{index + 1}. {exercise.title}</span>
                  {!exercise.required && <span className="text-orange-600">(Bonus)</span>}
                </CardTitle>
                <p className="text-gray-600 mt-2">{exercise.description}</p>
              </div>
              <Badge variant={exercise.required ? "destructive" : "secondary"} className="flex-shrink-0">
                {exercise.required ? "Required" : "Bonus"}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="demo">Demo</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-4">
                <div className="space-y-4">
                  <Label htmlFor={`approach-${exercise.id}`}>Your Approach & Implementation Notes</Label>
                  <Textarea
                    id={`approach-${exercise.id}`}
                    placeholder="Describe your technical approach, key decisions, challenges faced, and how you ensured security and compliance..."
                    value={answers[exercise.id]?.approach || ""}
                    onChange={(e) => handleAnswerChange(exercise.id, "approach", e.target.value)}
                    className="min-h-[120px] resize-y"
                    required={exercise.required}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="code" className="mt-4">
                <div className="space-y-4">
                  <Label htmlFor={`code-${exercise.id}`}>Code Snippet or Repository Link</Label>
                  <Textarea
                    id={`code-${exercise.id}`}
                    placeholder="Paste your code here or provide a link to your repository..."
                    value={answers[exercise.id]?.code || ""}
                    onChange={(e) => handleAnswerChange(exercise.id, "code", e.target.value)}
                    className="min-h-[200px] resize-y font-mono text-sm"
                    style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                  />
                  <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4 text-gray-400" />
                    <Input
                      type="url"
                      placeholder="GitHub/GitLab repository URL (optional)"
                      value={answers[exercise.id]?.repoUrl || ""}
                      onChange={(e) => handleAnswerChange(exercise.id, "repoUrl", e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="files" className="mt-4">
                <div className="space-y-4">
                  <Label>Upload Project Files</Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors">
                    <input
                      type="file"
                      id={`file-${exercise.id}`}
                      className="hidden"
                      multiple
                      accept=".zip,.tar,.gz,.pdf,.doc,.docx,.txt,.md,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.cs"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        handleAnswerChange(exercise.id, "files", files);
                      }}
                    />
                    <label htmlFor={`file-${exercise.id}`} className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">
                        {answers[exercise.id]?.files?.length 
                          ? `${answers[exercise.id].files.length} file(s) selected`
                          : "Click to upload project files"
                        }
                      </p>
                      <p className="text-sm text-gray-400">
                        Supported: ZIP archives, source code files, documentation
                      </p>
                    </label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="demo" className="mt-4">
                <div className="space-y-4">
                  <Label htmlFor={`demo-${exercise.id}`}>Demo Video Link (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-gray-400" />
                    <Input
                      id={`demo-${exercise.id}`}
                      type="url"
                      placeholder="Loom, YouTube (unlisted), or other video platform URL"
                      value={answers[exercise.id]?.demoUrl || ""}
                      onChange={(e) => handleAnswerChange(exercise.id, "demoUrl", e.target.value)}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Optional: Record a short video demonstrating your solution in action
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Code className="w-3 h-3 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-purple-900 mb-2">Technical Exercise Guidelines</h4>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• Quality over quantity - focus on clean, well-documented code</li>
                <li>• Include security considerations and HIPAA compliance notes</li>
                <li>• Use modern frameworks and best practices</li>
                <li>• Add unit tests or explain your testing strategy</li>
                <li>• Consider responsive design and accessibility</li>
                <li>• Document your setup and deployment process</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalExercises;
