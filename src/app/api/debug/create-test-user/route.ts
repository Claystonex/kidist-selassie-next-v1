import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * This is a diagnostic API endpoint to test user creation in the database
 * It helps verify if the database connection and user creation logic are working properly
 * IMPORTANT: This should be disabled or protected in production
 */
export async function POST(request: NextRequest) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        status: 'error', 
        message: 'This endpoint is only available in development mode' 
      }, { status: 403 });
    }
    
    // Get test user data from request or use defaults
    let userData;
    try {
      userData = await request.json();
    } catch (e) {
      userData = {};
    }
    
    const testId = userData.id || `test-user-${Date.now()}`;
    const testEmail = userData.email || `test-user-${Date.now()}@example.com`;
    const testFirstName = userData.firstName || 'Test';
    const testLastName = userData.lastName || 'User';
    
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connection successful');
    
    console.log(`Creating test user: ${testId} (${testEmail})`);
    
    // Create a test user
    const newUser = await prisma.user.create({
      data: {
        id: testId,
        emailAddress: testEmail,
        firstName: testFirstName,
        lastName: testLastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    console.log('Test user created successfully:', newUser);
    
    return NextResponse.json({
      status: 'success',
      message: 'Test user created successfully',
      user: newUser
    });
  } catch (error: any) {
    console.error('Error creating test user:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
