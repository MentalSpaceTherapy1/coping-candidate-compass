
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

export async function sendInvitationEmail(
  supabaseClient: any,
  candidateEmail: string,
  candidateName: string | null,
  interviewUrl: string
) {
  console.log("Sending invitation email using Resend...");
  
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  // Use Resend API directly instead of Supabase's user creation
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
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Interview Invitation</h1>
          <p>Hello${candidateName ? ` ${candidateName}` : ''},</p>
          <p>You have been invited to complete an interview process with MentalSpace.</p>
          <p>To get started, please click the link below to create your account and begin the interview:</p>
          <a href="${interviewUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Start Interview Process</a>
          <p>This invitation link will expire in 7 days.</p>
          <p>Best regards,<br>The MentalSpace Team</p>
        </div>
      `,
    }),
  });

  if (!emailResponse.ok) {
    const errorText = await emailResponse.text();
    console.error('Resend API error:', errorText);
    throw new Error(`Failed to send email: ${errorText}`);
  }

  const emailResult = await emailResponse.json();
  console.log("Email sent successfully via Resend:", emailResult);
  
  return emailResult;
}
