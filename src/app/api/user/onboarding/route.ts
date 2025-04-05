import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Get the user ID from auth
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the request body
    const body = await request.json();
    const { firstName, lastName, nickname, phoneNumber } = body;
    
    if (!firstName || !lastName || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Find user in database
    let user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Update or create user data
    const userData = {
      firstName,
      lastName,
      emailAddress: user?.emailAddress || `${userId}@example.com`, // Fallback email
      phoneNumber, 
      onboardingCompleted: true,
      updatedAt: new Date(),
    };
    
    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: userId },
        data: userData,
      });
    } else {
      // Create new user if not exists (should be rare due to webhook)
      user = await prisma.user.create({
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
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
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
    return NextResponse.json({ 
      error: 'Failed to save user data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
