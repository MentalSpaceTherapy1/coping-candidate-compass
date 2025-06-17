
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

interface CandidateStatusBadgeProps {
  status: string;
}

export const CandidateStatusBadge = ({ status }: CandidateStatusBadgeProps) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
    case "in-progress":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>;
    case "draft":
      return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Draft</Badge>;
    case "invited":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
        <Mail className="w-3 h-3 mr-1" />
        Invited
      </Badge>;
    case "not-started":
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Not Started</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};
