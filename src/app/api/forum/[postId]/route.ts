import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { auth } from '@clerk/nextjs/server';

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

// DELETE /api/forum/[postId]
export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    // Check authentication
    const authResult = await auth();
    const userId = authResult?.userId;
    
    if (!userId) {
      return createJsonResponse({ error: 'You must be signed in to delete a post' }, 401);
    }

    const postId = params.postId;
    
    if (!postId) {
      return createJsonResponse({ error: 'Post ID is required' }, 400);
    }

    // Check if post exists and user is the author
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    if (!post) {
      return createJsonResponse({ error: 'Post not found' }, 404);
    }

    if (post.authorId !== userId) {
      return createJsonResponse({ error: 'You can only delete your own posts' }, 403);
    }

    try {
      // Delete the post - wrap in try/catch to handle potential connection issues
      await prisma.forumPost.delete({
        where: { id: postId },
      });
      
      return createJsonResponse({ success: true, message: 'Post deleted successfully' });
    } catch (dbError) {
      console.error('Database error when deleting post:', dbError);
      return createJsonResponse({ 
        error: 'Database error when deleting post', 
        message: dbError instanceof Error ? dbError.message : "Unknown database error" 
      }, 500);
    }
  } catch (error) {
    console.error('Error in delete post endpoint:', error);
    return createJsonResponse({
      error: 'Failed to delete post',
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
}
