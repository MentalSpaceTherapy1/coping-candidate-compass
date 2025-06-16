
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Star, Clock, FileText, Video } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/ff59cade-15f3-4d94-80a2-7c1383242387.png" 
              alt="MentalSpace Logo" 
              className="h-12 w-auto"
            />
            <div>
              <p className="text-sm text-gray-600">Therapy & Healing Counseling</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                Start Application
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
            Developer Opportunity
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Join Our Mission to Transform
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600"> Mental Healthcare</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            We're looking for talented developers to help build secure, scalable, and compassionate technology 
            solutions for mental health professionals and their clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-3">
                Start Your Interview
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What We're Building</h2>
            <p className="text-gray-600 text-lg">Cutting-edge technology for mental health professionals</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <Shield className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>HIPAA-Compliant Platform</CardTitle>
                <CardDescription>
                  Secure, encrypted systems that protect sensitive patient data and comply with healthcare regulations.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <Video className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Telehealth Solutions</CardTitle>
                <CardDescription>
                  Real-time video conferencing, secure messaging, and appointment scheduling for remote therapy sessions.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <FileText className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>EHR Integration</CardTitle>
                <CardDescription>
                  Electronic health records, session notes, treatment plans, and comprehensive patient management systems.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Interview Process */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Interview Process</h2>
            <p className="text-gray-600 text-lg">A comprehensive evaluation designed to showcase your skills</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-md">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">General Questions</h3>
                <p className="text-gray-600">Share your experience with web/mobile development, healthcare platforms, and security practices.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-md">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Technical Scenarios</h3>
                <p className="text-gray-600">Problem-solving questions about multi-tenancy, security, API integration, and healthcare-specific challenges.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-md">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Coding Exercises</h3>
                <p className="text-gray-600">Hands-on projects including authentication, EHR forms, scheduling, messaging, and mobile development.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-md">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Culture & Team Fit</h3>
                <p className="text-gray-600">Questions about your motivation, teamwork style, and approach to healthcare technology.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join us in building technology that helps mental health professionals provide better care to their clients.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Begin Your Interview
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src="/lovable-uploads/ff59cade-15f3-4d94-80a2-7c1383242387.png" 
              alt="MentalSpace Logo" 
              className="h-8 w-auto"
            />
          </div>
          <p className="text-gray-400 mb-4">Transforming mental healthcare through technology</p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
