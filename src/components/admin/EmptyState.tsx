
import { Users } from "lucide-react";
import { InviteCandidate } from "@/components/InviteCandidate";

export const EmptyState = () => {
  return (
    <div className="text-center py-8">
      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates yet</h3>
      <p className="text-gray-600 mb-4">Invite candidates to start seeing them here.</p>
      <InviteCandidate />
    </div>
  );
};
