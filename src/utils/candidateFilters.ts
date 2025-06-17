
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

export const filterCandidates = (
  candidates: Candidate[],
  searchTerm: string,
  statusFilter: string
): Candidate[] => {
  return candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || candidate.submissionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });
};

export const getCandidateStats = (candidates: Candidate[]) => {
  const completedCount = candidates.filter(c => c.submissionStatus === "completed").length;
  const inProgressCount = candidates.filter(c => c.submissionStatus === "in-progress").length;
  const invitedCount = candidates.filter(c => c.submissionStatus === "invited").length;
  
  return {
    totalCandidates: candidates.length,
    completedCount,
    inProgressCount,
    invitedCount
  };
};
