
import { Resend } from "npm:resend@2.0.0";
import { generateEmailHTML } from "./email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

export async function sendInvitationEmail(
  candidateEmail: string,
  candidateName: string | null,
  interviewUrl: string
) {
  console.log("Sending email...");
  
  const emailResponse = await resend.emails.send({
    from: "MentalSpace Hiring <hrservices@chctherapy.com>",
    to: [candidateEmail],
    subject: "Interview Invitation - MentalSpace Position",
    html: generateEmailHTML(candidateName, interviewUrl),
  });

  if (emailResponse.error) {
    console.error("Email error:", emailResponse.error);
    throw new Error(`Failed to send email: ${emailResponse.error.message}`);
  }

  console.log("Email sent successfully:", emailResponse);
  return emailResponse;
}
