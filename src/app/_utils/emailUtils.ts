// Email utility functions for the application

/**
 * Sends a welcome email to a newly registered user
 * 
 * @param email User's email address
 * @param name User's name
 * @param language User's preferred language (defaults to 'en')
 * @returns Promise resolving to the API response
 */
export async function sendWelcomeEmail(email: string, name: string, language: string = 'en') {
  try {
    // Generate the personalized variables for the email template
    const variables = [
      {
        email: email,
        substitutions: [
          {
            var: 'user_name',
            value: name || 'Friend'
          },
          {
            var: 'current_year',
            value: new Date().getFullYear().toString()
          },
          {
            var: 'language',
            value: language
          }
        ]
      }
    ];

    // Get the correct template ID based on language
    // You would set up these templates in your MailerSend account
    const templateId = getTemplateIdByLanguage('welcome', language);

    // Make the API call to the email sending endpoint
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateId,
        recipients: { email, name },
        variables,
        subject: 'Welcome to Ethiopian Selassie Youth Community',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send welcome email:', errorData);
      return { success: false, error: errorData };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

/**
 * Sends a batch email to multiple recipients (for admin use)
 * 
 * @param recipients Array of recipient objects with email and name
 * @param templateId MailerSend template ID
 * @param subject Email subject
 * @param variables Template variables
 * @returns Promise resolving to the API response
 */
export async function sendBatchEmail(
  recipients: Array<{ email: string; name?: string }>,
  templateId: string,
  subject: string,
  variables?: any[]
) {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateId,
        recipients,
        variables,
        subject,
        isAdminEmail: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send batch email:', errorData);
      return { success: false, error: errorData };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error sending batch email:', error);
    return { success: false, error };
  }
}

/**
 * Gets the appropriate template ID based on the language
 * These IDs would need to be created in your MailerSend account
 * 
 * @param templateType Type of template (welcome, newsletter, etc.)
 * @param language Language code (en, am, fr, es)
 * @returns The template ID
 */
function getTemplateIdByLanguage(templateType: string, language: string = 'en'): string {
  // These would be the template IDs you create in your MailerSend account
  // Replace these with your actual template IDs
  const templates: Record<string, Record<string, string>> = {
    welcome: {
      en: process.env.NEXT_PUBLIC_MAILERSEND_WELCOME_TEMPLATE_EN || '',
      am: process.env.NEXT_PUBLIC_MAILERSEND_WELCOME_TEMPLATE_AM || '',
      fr: process.env.NEXT_PUBLIC_MAILERSEND_WELCOME_TEMPLATE_FR || '',
      es: process.env.NEXT_PUBLIC_MAILERSEND_WELCOME_TEMPLATE_ES || '',
    },
    newsletter: {
      en: process.env.NEXT_PUBLIC_MAILERSEND_NEWSLETTER_TEMPLATE_EN || '',
      am: process.env.NEXT_PUBLIC_MAILERSEND_NEWSLETTER_TEMPLATE_AM || '',
      fr: process.env.NEXT_PUBLIC_MAILERSEND_NEWSLETTER_TEMPLATE_FR || '',
      es: process.env.NEXT_PUBLIC_MAILERSEND_NEWSLETTER_TEMPLATE_ES || '',
    },
    announcement: {
      en: process.env.NEXT_PUBLIC_MAILERSEND_ANNOUNCEMENT_TEMPLATE_EN || '',
      am: process.env.NEXT_PUBLIC_MAILERSEND_ANNOUNCEMENT_TEMPLATE_AM || '',
      fr: process.env.NEXT_PUBLIC_MAILERSEND_ANNOUNCEMENT_TEMPLATE_FR || '',
      es: process.env.NEXT_PUBLIC_MAILERSEND_ANNOUNCEMENT_TEMPLATE_ES || '',
    }
  };

  // If the requested language template doesn't exist, fall back to English
  return templates[templateType]?.[language] || templates[templateType]?.['en'] || '';
}
