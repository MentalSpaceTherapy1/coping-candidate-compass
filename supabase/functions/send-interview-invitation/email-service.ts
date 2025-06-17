
export async function sendInvitationEmail(
  supabaseClient: any,
  candidateEmail: string,
  candidateName: string | null,
  interviewUrl: string
) {
  console.log("Sending email via Supabase...");
  
  try {
    // Use Supabase's built-in email functionality
    const { data, error } = await supabaseClient.auth.admin.inviteUserByEmail(candidateEmail, {
      data: {
        full_name: candidateName,
        role: 'candidate',
        interview_url: interviewUrl
      },
      redirectTo: interviewUrl
    });

    if (error) {
      console.error("Supabase email error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log("Email sent successfully via Supabase:", data);
    return data;
  } catch (error: any) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
