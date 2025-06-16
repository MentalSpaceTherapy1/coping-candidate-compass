
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  candidateEmail: string;
  candidateName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    const { candidateEmail, candidateName }: InvitationRequest = await req.json();

    // Create invitation record
    const { data: invitation, error: insertError } = await supabaseClient
      .from('interview_invitations')
      .insert({
        candidate_email: candidateEmail,
        candidate_name: candidateName,
        sent_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create invitation: ${insertError.message}`);
    }

    // Generate interview link with token
    const interviewUrl = `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/interview?token=${invitation.invitation_token}`;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "MentalSpace <onboarding@resend.dev>",
      to: [candidateEmail],
      subject: "Interview Invitation - MentalSpace",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937; margin-bottom: 24px;">Interview Invitation</h1>
          
          <p>Dear ${candidateName || 'Candidate'},</p>
          
          <p>You have been invited to complete an interview for a position at MentalSpace.</p>
          
          <p>This interview consists of multiple sections including:</p>
          <ul>
            <li>General Questions</li>
            <li>Technical Scenarios</li>
            <li>Technical Exercises</li>
            <li>Culture Fit Assessment</li>
          </ul>
          
          <p>Please click the link below to begin your interview:</p>
          
          <a href="${interviewUrl}" 
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Start Interview
          </a>
          
          <p><strong>Important:</strong> This invitation expires in 7 days. Please complete the interview before the expiration date.</p>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>The MentalSpace Team</p>
          
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            If you're unable to click the button above, copy and paste this link into your browser:<br>
            ${interviewUrl}
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    console.log("Interview invitation sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      invitationId: invitation.id,
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-interview-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
