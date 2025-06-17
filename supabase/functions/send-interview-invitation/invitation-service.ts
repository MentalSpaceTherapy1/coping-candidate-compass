
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

export async function createInvitationRecord(
  supabaseClient: any,
  candidateEmail: string,
  candidateName: string | null,
  userId: string
) {
  console.log("Creating invitation record...");
  
  const { data: invitation, error: insertError } = await supabaseClient
    .from('interview_invitations')
    .insert({
      candidate_email: candidateEmail,
      candidate_name: candidateName,
      sent_by: userId,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Insert error:", insertError);
    throw new Error(`Failed to create invitation: ${insertError.message}`);
  }

  console.log("Invitation created:", invitation);
  return invitation;
}

export async function validateUser(supabaseClient: any) {
  console.log("Getting authenticated user...");
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    console.error("Auth error:", authError);
    throw new Error('Unauthorized');
  }

  console.log("Checking user role for:", user.id);
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    console.error("Profile error or insufficient permissions:", profileError, profile);
    throw new Error('Insufficient permissions');
  }

  return user;
}
