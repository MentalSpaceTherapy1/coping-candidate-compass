
import type { Database } from '@/integrations/supabase/types';

type InterviewSection = Database['public']['Enums']['interview_section'];

export const sectionMapping: Record<string, InterviewSection> = {
  'generalQuestions': 'general',
  'technicalScenarios': 'technical_scenarios',
  'technicalExercises': 'technical_exercises',
  'cultureQuestions': 'culture'
};

export const reverseSectionMapping: Record<string, string> = {
  'general': 'generalQuestions',
  'technical_scenarios': 'technicalScenarios',
  'technical_exercises': 'technicalExercises',
  'culture': 'cultureQuestions'
};

export function mapToDbSection(section: string): InterviewSection {
  return sectionMapping[section];
}

export function mapFromDbSection(dbSection: string): string {
  return reverseSectionMapping[dbSection] || dbSection;
}
