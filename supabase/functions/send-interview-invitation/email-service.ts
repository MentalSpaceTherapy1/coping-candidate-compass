
export async function sendInvitationEmail(
  adminClient: any,
  candidateEmail: string,
  candidateName: string | null,
  interviewUrl: string
) {
  console.log("Sending email via Supabase admin client...");
  
  try {
    // Use admin client with service role permissions for email operations
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(candidateEmail, {
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
