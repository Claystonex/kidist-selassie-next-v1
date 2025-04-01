import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

// Email templates
const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  NEWSLETTER: 'newsletter',
  ANNOUNCEMENT: 'announcement'
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication for admin routes
    const authData = await auth();
    const { userId } = authData;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestData = await request.json();
    const { 
      templateId, 
      recipients, 
      variables, 
      subject,
      isAdminEmail = false
    } = requestData;

    // For admin emails, verify admin status
    if (isAdminEmail) {
      // You would need to implement admin checking logic here
      // This is just a placeholder for your actual admin verification
      const user = await currentUser();
      const isAdmin = user?.publicMetadata?.role === 'admin';
      
      if (!isAdmin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      }
    }

    // Initialize MailerSend
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY || "",
    });

    // Create sender
    const sender = new Sender(
      process.env.MAILERSEND_FROM_EMAIL || "noreply@ethkidist.org",
      process.env.MAILERSEND_FROM_NAME || "Ethiopian Selassie Youth"
    );

    // Process recipients
    const emailRecipients = Array.isArray(recipients)
      ? recipients.map(r => new Recipient(r.email, r.name))
      : [new Recipient(recipients.email, recipients.name)];

    // Create email params
    const emailParams = new EmailParams()
      .setFrom(sender)
      .setTo(emailRecipients)
      .setSubject(subject || "Message from Ethiopian Selassie Youth")
      .setTemplateId(templateId);

    // Add variables if provided
    if (variables) {
      // Use type assertion to work around incomplete type definitions
      (emailParams as any).setVariables(variables);
    }

    // Send the email
    const response = await mailerSend.email.send(emailParams);

    return NextResponse.json({ 
      success: true,
      message: "Email sent successfully",
      data: response
    });
    
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ 
      error: "Failed to send email", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { 
      status: 500 
    });
  }
}
