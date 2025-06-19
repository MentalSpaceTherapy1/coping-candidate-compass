
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { generateEmailHTML } from './email-template.ts';

export async function sendInvitationEmail(
  supabaseClient: any,
  candidateEmail: string,
  candidateName: string | null,
  interviewUrl: string
) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'MentalSpace Interview <noreply@resend.dev>',
      to: [candidateEmail],
      subject: 'Interview Invitation - MentalSpace',
      html: generateEmailHTML(candidateName, interviewUrl),
    }),
  });

  if (!emailResponse.ok) {
    const errorText = await emailResponse.text();
    console.error('Resend API error:', errorText);
    throw new Error(`Failed to send email: ${errorText}`);
  }

  const emailResult = await emailResponse.json();
  return emailResult;
}
