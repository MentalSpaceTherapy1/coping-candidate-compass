
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CandidateActions } from "./CandidateActions";
import { CandidateStatusBadge } from "./CandidateStatusBadge";
import { CandidateScoreDisplay } from "./CandidateScoreDisplay";
import { CandidateSectionScores } from "./CandidateSectionScores";

interface Candidate {
  id: string;
  name: string;
  email: string;
  submissionStatus: string;
  dateSubmitted: string;
  overallScore: number | null;
  sections: {
    general: number | null;
    technical: number | null;
    exercises: number | null;
    culture: number | null;
  };
}

interface CandidateTableProps {
  candidates: Candidate[];
  onCandidateDeleted?: () => void;
  onInviteResent?: () => void;
}

export const CandidateTable = ({ candidates, onCandidateDeleted, onInviteResent }: CandidateTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Candidate</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Overall Score</TableHead>
          <TableHead>Section Scores</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate) => (
          <TableRow key={candidate.id}>
            <TableCell>
              <div>
                <div className="font-medium">{candidate.name}</div>
                <div className="text-sm text-gray-500">{candidate.email}</div>
              </div>
            </TableCell>
            <TableCell>
              <CandidateStatusBadge status={candidate.submissionStatus} />
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>{new Date(candidate.dateSubmitted).toLocaleDateString()}</div>
                <div className="text-xs text-gray-500">
                  {candidate.submissionStatus === 'invited' ? 'Invited' : 'Submitted'}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <CandidateScoreDisplay score={candidate.overallScore} />
            </TableCell>
            <TableCell>
              <CandidateSectionScores sections={candidate.sections} />
            </TableCell>
            <TableCell>
              <CandidateActions 
                candidate={candidate}
                onCandidateDeleted={onCandidateDeleted}
                onInviteResent={onInviteResent}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
