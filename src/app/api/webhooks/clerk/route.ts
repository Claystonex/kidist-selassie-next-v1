import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/app/_utils/emailUtils';

// This is the Clerk webhook handler for user-related events
export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
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
    console.log('Processing user.created webhook event');
    
    try {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      console.log('User data received:', { id, email_addresses, first_name, last_name });
      
      // Make sure we have at least one email address
      if (!email_addresses || email_addresses.length === 0) {
        console.error(`User ${id} has no email addresses, cannot create in database`);
        return NextResponse.json({ success: false, error: 'No email address provided' }, { status: 400 });
      }
      
      const primaryEmail = email_addresses[0]?.email_address;
      if (!primaryEmail) {
        console.error(`User ${id} has invalid primary email, cannot create in database`);
        return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 });
      }
      
      const userName = [first_name, last_name].filter(Boolean).join(' ') || 'Member';
      console.log(`Attempting to create user in database: ${id} (${primaryEmail})`);
      
      // Test database connection first
      try {
        await prisma.$connect();
        console.log('Database connection successful');
      } catch (dbConnectError) {
        console.error('Failed to connect to database:', dbConnectError);
        return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
      }
      
      // Create user in database with better error handling
      try {
        const newUser = await prisma.user.create({
          data: {
            id: id,
            firstName: first_name || '',
            lastName: last_name || '',
            emailAddress: primaryEmail,
            imageUrl: image_url || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        
        console.log(`User ${id} successfully added to database`, newUser);
        
        // Send welcome email asynchronously
        sendWelcomeEmail(primaryEmail, userName).catch(emailError => {
          console.error('Error sending welcome email:', emailError);
        });
        
        console.log(`Welcome email triggered for user ${id} (${primaryEmail})`);
      } catch (createError: any) {
        if (createError.code === 'P2002') {
          console.log(`User ${id} already exists in database, skipping creation`);
        } else {
          console.error(`Error creating user ${id} in database:`, createError);
          console.error('Error details:', JSON.stringify(createError, null, 2));
          return NextResponse.json({ 
            success: false, 
            error: 'Failed to create user in database',
            details: createError.message
          }, { status: 500 });
        }
      }
    } catch (error) {
      console.error('Error processing user.created webhook:', error);
      return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
  } else {
    console.log(`Received webhook event: ${eventType} (not handling)`);
  }

  // Return a 200 response
  return NextResponse.json({ success: true });
}
