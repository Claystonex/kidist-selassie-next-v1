import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * This is a diagnostic API endpoint to check user synchronization between Clerk and your database
 * It will help identify issues with the webhook integration
 */
export async function GET(request: NextRequest) {
  try {
    // Test database connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Count users in the database
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} users in the database`);
    
    // Get the most recent users (up to 10)
    const recentUsers = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        emailAddress: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    });
    
    // Check environment variables
    const webhookSecretConfigured = !!process.env.CLERK_WEBHOOK_SECRET;
    const databaseUrlConfigured = !!process.env.DATABASE_URL;
    
    return NextResponse.json({
      status: 'success',
      databaseConnection: 'connected',
      environmentVariables: {
        CLERK_WEBHOOK_SECRET: webhookSecretConfigured ? 'configured' : 'missing',
        DATABASE_URL: databaseUrlConfigured ? 'configured' : 'missing'
      },
      userCount,
      recentUsers
    });
  } catch (error: any) {
    console.error('Error in user-sync diagnostic endpoint:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      environmentVariables: {
        CLERK_WEBHOOK_SECRET: !!process.env.CLERK_WEBHOOK_SECRET ? 'configured' : 'missing',
        DATABASE_URL: !!process.env.DATABASE_URL ? 'configured' : 'missing'
      }
    }, { status: 500 });
  }
}
