import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from '@clerk/nextjs/server';

// Helper function to create a JSON response
function createJsonResponse(data: any, status = 200) {
  // Ensure data is never null or undefined
  const safeData = data !== null && data !== undefined ? data : { error: "Empty response data" };
  
  try {
    // Additional safety check to ensure we never send null to NextResponse.json
    if (safeData === null || safeData === undefined) {
      console.error("Attempting to send null/undefined data in response");
      return NextResponse.json({ error: "Server error: Invalid response data" }, { status: 500 });
    }
    
    // Log the response we're sending for debugging
    console.log(`Sending ${status} response:`, 
      typeof safeData === 'object' 
        ? JSON.stringify(safeData).substring(0, 200) + (JSON.stringify(safeData).length > 200 ? '...' : '')
        : safeData
    );
    
    // If safeData is not an object, wrap it in an object
    const finalData = typeof safeData === 'object' ? safeData : { data: safeData };
    
    return NextResponse.json(finalData, { status });
  } catch (error) {
    // If serialization fails, send a safe fallback response
    console.error('Error in response creation:', error);
    return NextResponse.json({ 
      error: "Failed to create response",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// POST /api/forum/vote
export async function POST(request: Request) {
  try {
    console.log('Vote request received');
    
    // Get authentication
    const authResult = await auth();
    const userId = authResult?.userId;
    
    if (!userId) {
      return createJsonResponse({ error: 'User must be signed in to vote' }, 401);
    }
    
    // Check if user exists in the database, create if not
    let user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      console.log('User not found in database, creating new user record');
      try {
        console.log('Fetching user data from Clerk for user ID:', userId);
        let firstName = "";
        let lastName = "";
        let emailAddress = `${userId}@example.com`;
        let imageUrl = null;
        
        try {
          const user = await currentUser();
          if (user) {
            firstName = user.firstName || "";
            lastName = user.lastName || "";
            emailAddress = user.emailAddresses[0]?.emailAddress || emailAddress;
            imageUrl = user.imageUrl || null;
            console.log('Successfully fetched user data from Clerk');
          } else {
            console.log('User data not available from Clerk, using default values');
          }
        } catch (clerkError) {
          console.error('Error fetching user from Clerk, using default values:', clerkError);
          // Continue with default values
        }
        
        // Create user in our database
        console.log('Creating user in database with email:', emailAddress);
        user = await prisma.user.create({
          data: {
            id: userId,
            firstName,
            lastName,
            emailAddress,
            imageUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log('User created successfully with ID:', userId);
      } catch (userCreateError) {
        console.error('Error creating user:', userCreateError);
        return createJsonResponse({ 
          error: 'Failed to create user record',
          message: 'Please try again or contact support'
        }, 500);
      }
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return createJsonResponse({ error: 'Invalid request format' }, 400);
    }
    
    const { postId } = body || {};
    
    if (!postId) {
      return createJsonResponse({ error: 'Post ID is required' }, 400);
    }

    // Check if post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return createJsonResponse({ error: 'Post not found' }, 404);
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findFirst({
      where: {
        postId,
        userId,
      }
    });

    // Toggle vote (create if doesn't exist, delete if it does)
    if (existingVote) {
      // Remove vote
      await prisma.vote.delete({
        where: {
          id: existingVote.id
        }
      });
    } else {
      // Add vote
      await prisma.vote.create({
        data: {
          postId,
          userId,
        }
      });
    }

    // Get updated vote count
    const voteCount = await prisma.vote.count({
      where: {
        postId
      }
    });

    return createJsonResponse({ voteCount });
  } catch (error) {
    console.error('Error processing vote:', error);
    
    // Enhanced error handling for foreign key constraint errors
    if (
      (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') || 
      (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('foreign key constraint'))
    ) {
      return createJsonResponse({ 
        error: 'Database relationship error',
        message: 'Failed to process vote due to a foreign key constraint violation. This might be due to an invalid user ID or post ID.',
        details: error && typeof error === 'object' && 'message' in error ? error.message : 'Unknown error'
      }, 400);
    }
    
    return createJsonResponse({ 
      error: 'Failed to process vote',
      message: error && typeof error === 'object' && 'message' in error ? error.message : 'Unknown error'
    }, 500);
  }
}
