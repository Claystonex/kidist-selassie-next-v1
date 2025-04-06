import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Use currentUser instead of auth for more reliable access in API routes
    const clerkUser = await currentUser();
    const userId = clerkUser?.id;
    
    // Return early if no user ID (not authenticated)
    if (!userId) {
      console.error('Onboarding API: Unauthorized - No user ID from auth');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the request body
    const body = await request.json();
    const { firstName, lastName, nickname, phoneNumber } = body;
    
    if (!firstName || !lastName || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Find user in database
    let dbUser = await prisma.user.findUnique({ where: { id: userId } });
    
    // Update or create user data
    const userData = {
      firstName,
      lastName,
      emailAddress: clerkUser?.emailAddresses?.[0]?.emailAddress || `${userId}@example.com`, // Fallback email
      phoneNumber, 
      onboardingCompleted: true,
      updatedAt: new Date(),
    };
    
    if (dbUser) {
      // Update existing user
      dbUser = await prisma.user.update({
        where: { id: userId },
        data: userData,
      });
    } else {
      // Create new user if not exists (should be rare due to webhook)
      dbUser = await prisma.user.create({
        data: {
          id: userId,
          ...userData,
          createdAt: new Date(),
        },
      });
    }
    
    // Create response with success message
    const response = NextResponse.json({
      success: true,
      message: 'Onboarding complete',
      user: {
        id: dbUser.id,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
      },
    });
    
    // Set a cookie to track onboarding completion directly on the response
    response.cookies.set('onboarding_complete', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    
    return response;
  } catch (error) {
    console.error('Error in onboarding API:', error);
    
    // Include detailed error information for debugging
    return NextResponse.json({ 
      error: 'Failed to save user data',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.name : 'Unknown',
      stack: process.env.NODE_ENV !== 'production' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
