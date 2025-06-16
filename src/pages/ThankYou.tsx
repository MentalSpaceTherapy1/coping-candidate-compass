
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Clock, Mail } from "lucide-react";

const ThankYou = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-900">MentalSpace</h1>
              <p className="text-sm text-gray-600">Therapy & Healing</p>
            </div>
          </Link>
        </div>

        <Card className="border-0 shadow-xl text-center">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Thank You for Your Submission!
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Your interview application has been successfully submitted
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">What Happens Next?</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Initial Review</h4>
                    <p className="text-gray-600 text-sm">Our technical team will review your submission within 3-5 business days</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Technical Assessment</h4>
                    <p className="text-gray-600 text-sm">If selected, we'll schedule a technical interview to discuss your solutions</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Final Decision</h4>
                    <p className="text-gray-600 text-sm">We'll notify you of our decision and next steps within 2 weeks</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white rounded-lg border">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 text-sm">Response Time</h4>
                <p className="text-gray-600 text-xs">3-5 business days</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border">
                <Mail className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 text-sm">Communication</h4>
                <p className="text-gray-600 text-xs">Via email updates</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border">
                <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 text-sm">Next Step</h4>
                <p className="text-gray-600 text-xs">Technical interview</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <h4 className="font-medium text-blue-900 mb-2">Interview Summary</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• General questions about your background and experience</li>
                <li>• Technical scenarios and problem-solving questions</li>
                <li>• Hands-on coding exercises and project demonstrations</li>
                <li>• Culture and team fit assessment</li>
              </ul>
            </div>

            <div className="border-t pt-6">
              <p className="text-gray-600 mb-4">
                Questions about your application or our process?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline">
                  Contact Our Team
                </Button>
                <Link to="/">
                  <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                    Return to Homepage
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Application ID: MS-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
