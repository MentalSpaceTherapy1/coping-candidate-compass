
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, User } from "lucide-react";
import { InviteCandidate } from "@/components/InviteCandidate";

export const AdminHeader = () => {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/ff59cade-15f3-4d94-80a2-7c1383242387.png" 
              alt="MentalSpace Logo" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Interview Management</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            <InviteCandidate />
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
