
import { supabase } from '@/integrations/supabase/client';
import { mapToDbSection } from '@/utils/interviewSectionMapping';
import type { Database } from '@/integrations/supabase/types';

type InterviewAnswer = Database['public']['Tables']['interview_answers']['Row'];

export class InterviewAnswerService {
  static async saveAnswer(
    userId: string, 
    section: string, 
    questionKey: string, 
    value: any
  ): Promise<{ data: any; error: any }> {
    console.log('💾 Attempting to save answer:', {
      userId,
      section,
      questionKey,
      valueType: typeof value,
      valuePreview: typeof value === 'string' ? value.substring(0, 50) + '...' : value
    });

    const dbSection = mapToDbSection(section);
    console.log(`🗂️ Section mapping: ${section} -> ${dbSection}`);
    
    const answerData = {
      user_id: userId,
      question_key: questionKey,
      section: dbSection,
      answer: typeof value === 'string' ? value : null,
      metadata: typeof value !== 'string' ? { type: 'complex', value } : {}
    };

    console.log('📤 Saving answer data:', answerData);

    const { data, error } = await supabase
      .from('interview_answers')
      .upsert(answerData, {
        onConflict: 'user_id,question_key,section'
      })
      .select();

    return { data, error };
  }

  static async loadAnswers(userId: string): Promise<{ data: InterviewAnswer[] | null; error: any }> {
    console.log('💬 Loading answers for user:', userId);
    
    const { data, error } = await supabase
      .from('interview_answers')
      .select('*')
      .eq('user_id', userId);

    return { data, error };
  }

  static processAnswersData(answersData: InterviewAnswer[]): Record<string, any> {
    console.log('📋 Raw answers data:', answersData);
    
    const answersMap: Record<string, any> = {
      generalQuestions: {},
      technicalScenarios: {},
      technicalExercises: {},
      cultureQuestions: {}
    };

    answersData.forEach((answer: InterviewAnswer) => {
      const sectionKey = answer.section === 'general' ? 'generalQuestions'
        : answer.section === 'technical_scenarios' ? 'technicalScenarios'
        : answer.section === 'technical_exercises' ? 'technicalExercises'
        : 'cultureQuestions';
      
      console.log(`📝 Processing answer: section=${answer.section} -> sectionKey=${sectionKey}, question=${answer.question_key}`);
      
      // Safely check if metadata is an object with type property
      const isComplexAnswer = answer.metadata && 
        typeof answer.metadata === 'object' && 
        answer.metadata !== null && 
        !Array.isArray(answer.metadata) &&
        'type' in answer.metadata && 
        (answer.metadata as any).type === 'complex';
      
      answersMap[sectionKey][answer.question_key] = isComplexAnswer && 'value' in (answer.metadata as any)
        ? (answer.metadata as any).value 
        : answer.answer;
    });

    console.log('📊 Final answers map:', answersMap);
    return answersMap;
  }
}
