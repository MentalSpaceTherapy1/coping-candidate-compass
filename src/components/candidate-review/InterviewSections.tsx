
import SectionCard from "./SectionCard";

interface InterviewSectionsProps {
  sections: {
    general: { score: number | null; answers: string[] };
    technical: { score: number | null; answers: string[] };
    exercises: { score: number | null; answers: string[] };
    culture: { score: number | null; answers: string[] };
  };
}

const InterviewSections = ({ sections }: InterviewSectionsProps) => {
  return (
    <div className="space-y-6">
      {Object.entries(sections).map(([sectionKey, sectionData]) => (
        <SectionCard
          key={sectionKey}
          sectionKey={sectionKey}
          sectionData={sectionData}
        />
      ))}
    </div>
  );
};

export default InterviewSections;
