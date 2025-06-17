
import { Link } from "react-router-dom";
import { ProfileDropdown } from "@/components/ProfileDropdown";

export const CandidateHeader = () => {
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
              <h1 className="text-lg font-bold text-gray-900">MentalSpace</h1>
              <p className="text-sm text-gray-600">Interview Process</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};
