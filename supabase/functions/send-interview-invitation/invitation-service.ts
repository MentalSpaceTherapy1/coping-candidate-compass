
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

export async function validateUser(supabaseClient: any) {
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  
  if (userError || !user) {
    throw new Error('Unauthorized: Invalid or missing authentication');
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('Unauthorized: User profile not found');
  }

  if (profile.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  return user;
}

export async function createInvitationRecord(
  supabaseClient: any,
  candidateEmail: string,
  candidateName: string | null,
  sentBy: string
) {
  const { data: invitation, error } = await supabaseClient
    .from('interview_invitations')
    .insert({
      candidate_email: candidateEmail,
      candidate_name: candidateName,
      sent_by: sentBy,
      status: 'sent'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create invitation record: ${error.message}`);
  }

  return invitation;
}
