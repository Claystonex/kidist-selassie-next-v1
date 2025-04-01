import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/app/_utils/emailUtils';

// This is the Clerk webhook handler for user-related events
export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying webhook', { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;
  
  if (eventType === 'user.created') {
    // A new user was created
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    // Make sure we have at least one email address
    if (email_addresses && email_addresses.length > 0) {
      const primaryEmail = email_addresses[0].email_address;
      const userName = [first_name, last_name].filter(Boolean).join(' ') || 'Member';
      
      try {
        // Send welcome email asynchronously
        // Note: we're not awaiting this to prevent blocking the webhook response
        sendWelcomeEmail(primaryEmail, userName).catch(error => {
          console.error('Error sending welcome email:', error);
        });
        
        console.log(`Welcome email triggered for user ${id} (${primaryEmail})`);
      } catch (error) {
        console.error('Error processing new user webhook:', error);
      }
    }
  }

  // Return a 200 response
  return NextResponse.json({ success: true });
}
