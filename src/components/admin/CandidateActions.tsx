import { ReviewButton } from "./actions/ReviewButton";
import { ExportButton } from "./actions/ExportButton";
import { ResendInviteButton } from "./actions/ResendInviteButton";
import { DeleteCandidateDialog } from "./actions/DeleteCandidateDialog";
import { Candidate } from "@/types/candidate";

interface CandidateActionsProps {
  candidate: Candidate;
  onCandidateDeleted?: () => void;
  onInviteResent?: () => void;
}

export const CandidateActions = ({ candidate, onCandidateDeleted, onInviteResent }: CandidateActionsProps) => {
  return (
    <div className="flex space-x-2">
      <ReviewButton candidate={candidate} />
      <ExportButton candidate={candidate} />
      <ResendInviteButton candidate={candidate} onInviteResent={onInviteResent} />
      <DeleteCandidateDialog candidate={candidate} onCandidateDeleted={onCandidateDeleted} />
    </div>
  );
};
