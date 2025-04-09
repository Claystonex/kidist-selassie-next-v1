import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

/**
 * This endpoint syncs all existing Clerk users to the database
 * It should be called once to ensure all users are properly synced
 */
export async function GET(request: NextRequest) {
  try {
    // Verify database connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Get all users from Clerk
    console.log('Fetching users from Clerk...');
    const clerk = await clerkClient();
    const clerkUsersResponse = await clerk.users.getUserList({
      limit: 100, // Adjust if you have more users
    });
    
    const clerkUsers = clerkUsersResponse.data;
    console.log(`Found ${clerkUsers.length} users in Clerk`);
    
    // Get all users from database for comparison
    const dbUsers = await prisma.user.findMany({
      select: { id: true }
    });
    
    const dbUserIds = new Set(dbUsers.map(user => user.id));
    console.log(`Found ${dbUsers.length} users in database`);
    
    // Track sync results
    const results = {
      total: clerkUsers.length,
      alreadySynced: 0,
      newlySynced: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    // Process each Clerk user
    for (const clerkUser of clerkUsers) {
      try {
        // Skip if user already exists in database
        if (dbUserIds.has(clerkUser.id)) {
          console.log(`User ${clerkUser.id} already exists in database, skipping`);
          results.alreadySynced++;
          continue;
        }
        
        // Get primary email
        const primaryEmail = clerkUser.emailAddresses.find(
          (email: any) => email.id === clerkUser.primaryEmailAddressId
        )?.emailAddress;
        
        if (!primaryEmail) {
          console.warn(`User ${clerkUser.id} has no primary email, skipping`);
          results.failed++;
          results.errors.push(`User ${clerkUser.id} has no primary email`);
          continue;
        }
        
        // Create user in database
        await prisma.user.create({
          data: {
            id: clerkUser.id,
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
            emailAddress: primaryEmail,
            imageUrl: clerkUser.imageUrl || null,
            createdAt: new Date(clerkUser.createdAt),
            updatedAt: new Date(),
          },
        });
        
        console.log(`Created user ${clerkUser.id} in database`);
        results.newlySynced++;
      } catch (error: any) {
        console.error(`Error syncing user ${clerkUser.id}:`, error);
        results.failed++;
        results.errors.push(`User ${clerkUser.id}: ${error.message}`);
      }
    }
    
    // Get updated user count
    const updatedUserCount = await prisma.user.count();
    
    return NextResponse.json({
      status: 'success',
      message: `Sync completed. ${results.newlySynced} users added, ${results.alreadySynced} already synced, ${results.failed} failed.`,
      results,
      updatedUserCount,
    });
  } catch (error: any) {
    console.error('Error in sync-all-users endpoint:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
