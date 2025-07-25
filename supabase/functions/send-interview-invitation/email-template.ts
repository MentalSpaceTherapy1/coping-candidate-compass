
export function generateEmailHTML(candidateName: string | null, interviewUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Interview Invitation - MentalSpace</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .logo { max-width: 200px; height: auto; margin-bottom: 15px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; margin-bottom: 20px; color: #1f2937; }
        .main-text { font-size: 16px; margin-bottom: 25px; color: #374151; }
        .interview-sections { background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
        .interview-sections h3 { margin-top: 0; color: #1f2937; font-size: 18px; }
        .interview-sections ul { margin: 10px 0; padding-left: 20px; }
        .interview-sections li { margin: 8px 0; color: #4b5563; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 25px 0; box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.39); transition: all 0.2s ease; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px 0 rgba(102, 126, 234, 0.5); }
        .important-note { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 25px 0; }
        .important-note strong { color: #92400e; }
        .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 5px 0; color: #6b7280; font-size: 14px; }
        .link-fallback { font-size: 12px; color: #6b7280; margin-top: 20px; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://c7c120bb-200e-4a7f-b1ea-e1623e423468.lovableproject.com/lovable-uploads/ff59cade-15f3-4d94-80a2-7c1383242387.png" alt="MentalSpace Logo" class="logo" />
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Interview Invitation</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            Dear ${candidateName || 'Candidate'},
          </div>
          
          <div class="main-text">
            We are excited to invite you to complete an interview for a position at <strong>MentalSpace</strong>. We were impressed with your background and believe you could be a great fit for our team.
          </div>
          
          <div class="interview-sections">
            <h3>📋 Interview Overview</h3>
            <p style="margin-bottom: 15px;">Your interview will consist of the following sections:</p>
            <ul>
              <li><strong>General Questions</strong> - Get to know you better</li>
              <li><strong>Technical Scenarios</strong> - Problem-solving approach</li>
              <li><strong>Technical Exercises</strong> - Hands-on skills assessment</li>
              <li><strong>Culture Fit Assessment</strong> - Team compatibility</li>
            </ul>
            <p style="margin-top: 15px; margin-bottom: 0; font-size: 14px; color: #6b7280;">
              <em>Estimated completion time: 45-60 minutes</em>
            </p>
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${interviewUrl}" class="cta-button">
              🚀 Start Your Interview
            </a>
          </div>
          
          <div class="important-note">
            <strong>⏰ Important:</strong> This invitation expires in 7 days from today. Please complete your interview before the expiration date to ensure your application is considered.
          </div>
          
          <div class="main-text">
            We understand that interviews can be nerve-wracking, but please know that we're rooting for your success. Take your time, be yourself, and showcase your unique skills and experiences.
          </div>
          
          <div class="main-text">
            If you have any questions or encounter any technical difficulties, please don't hesitate to reach out to our hiring team.
          </div>
          
          <div style="margin-top: 40px;">
            <p style="margin-bottom: 5px;">Best regards,</p>
            <p style="margin: 0; font-weight: 600; color: #1f2937;">The MentalSpace Hiring Team</p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>MentalSpace</strong> - Transforming Mental Health Care</p>
          <p>This email was sent regarding your job application</p>
          
          <div class="link-fallback">
            <p><strong>Can't click the button above?</strong><br>
            Copy and paste this link into your browser:</p>
            <p>${interviewUrl}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
