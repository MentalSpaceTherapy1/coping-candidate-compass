
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
  candidateName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Function called with method:", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      status: 405, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    console.log("Creating Supabase client...");
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
    console.log("Getting authenticated user...");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      throw new Error('Unauthorized');
    }

    // Check if user is admin
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

    console.log("Parsing request body...");
    const body = await req.text();
    console.log("Request body:", body);
    
    let requestData: InvitationRequest;
    try {
      requestData = JSON.parse(body);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { candidateEmail, candidateName } = requestData;

    if (!candidateEmail) {
      throw new Error('Candidate email is required');
    }

    console.log("Creating invitation record...");
    // Create invitation record
    const { data: invitation, error: insertError } = await supabaseClient
      .from('interview_invitations')
      .insert({
        candidate_email: candidateEmail,
        candidate_name: candidateName || null,
        sent_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Failed to create invitation: ${insertError.message}`);
    }

    console.log("Invitation created:", invitation);

    // Generate interview link with token
    const interviewUrl = `${Deno.env.get('SITE_URL') || 'https://c7c120bb-200e-4a7f-b1ea-e1623e423468.lovableproject.com'}/interview?token=${invitation.invitation_token}`;

    console.log("Sending email...");
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
      console.error("Email error:", emailResponse.error);
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    console.log("Email sent successfully:", emailResponse);

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
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
