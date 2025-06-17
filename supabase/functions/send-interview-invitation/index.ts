
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { InvitationRequest, corsHeaders } from "./types.ts";
import { validateUser, createInvitationRecord } from "./invitation-service.ts";
import { sendInvitationEmail } from "./email-service.ts";

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Validate user authentication and permissions
    const user = await validateUser(supabaseClient);

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

    // Create invitation record
    const invitation = await createInvitationRecord(
      supabaseClient,
      candidateEmail,
      candidateName || null,
      user.id
    );

    // Generate interview link with token
    const interviewUrl = `${Deno.env.get('SITE_URL') || 'https://c7c120bb-200e-4a7f-b1ea-e1623e423468.lovableproject.com'}/interview?token=${invitation.invitation_token}`;

    // Send invitation email using Supabase
    const emailResponse = await sendInvitationEmail(
      supabaseClient,
      candidateEmail,
      candidateName || null,
      interviewUrl
    );

    return new Response(JSON.stringify({ 
      success: true, 
      invitationId: invitation.id,
      emailId: emailResponse?.user?.id 
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
