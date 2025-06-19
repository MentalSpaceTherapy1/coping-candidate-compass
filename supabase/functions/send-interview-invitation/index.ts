
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { InvitationRequest, corsHeaders } from "./types.ts";
import { validateUser, createInvitationRecord } from "./invitation-service.ts";
import { sendInvitationEmail } from "./email-service.ts";

const handler = async (req: Request): Promise<Response> => {
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

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const user = await validateUser(userClient);

    const body = await req.text();
    
    let requestData: InvitationRequest;
    try {
      requestData = JSON.parse(body);
    } catch (parseError) {
      throw new Error('Invalid JSON in request body');
    }

    const { candidateEmail, candidateName } = requestData;

    if (!candidateEmail) {
      throw new Error('Candidate email is required');
    }

    const invitation = await createInvitationRecord(
      userClient,
      candidateEmail,
      candidateName || null,
      user.id
    );

    const interviewUrl = `https://mentalspace-interview.lovable.app/register?token=${invitation.invitation_token}`;

    const emailResponse = await sendInvitationEmail(
      userClient,
      candidateEmail,
      candidateName || null,
      interviewUrl
    );

    return new Response(JSON.stringify({ 
      success: true, 
      invitationId: invitation.id,
      emailId: emailResponse?.id 
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
