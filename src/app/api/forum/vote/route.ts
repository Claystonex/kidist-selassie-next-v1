import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// POST /api/forum/vote
export async function POST(request: Request) {
  try {
    console.log('Vote request received');
    const { userId } = await auth();
    if (!userId) {
      console.log('Unauthorized - No user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postId } = body;
    console.log('Vote request data:', { userId, postId });

    if (!postId) {
      console.log('Bad request - Missing postId');
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Verify post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      console.log('Post not found:', postId);
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId
        }
      }
    });

    console.log('Existing vote:', existingVote);

    if (existingVote) {
      // Remove vote if it exists
      console.log('Removing existing vote');
      await prisma.vote.delete({
        where: {
          userId_postId: {
            userId: userId,
            postId
          }
        }
      });
    } else {
      // Create new vote
      console.log('Creating new vote');
      await prisma.vote.create({
        data: {
          userId: userId,
          postId
        }
      });
    }

    // Get updated vote count
    const voteCount = await prisma.vote.count({
      where: {
        postId
      }
    });

    console.log('Updated vote count:', voteCount);
    return NextResponse.json({ voteCount });
  } catch (error) {
    console.error('Error handling vote:', error);
    return NextResponse.json({ error: 'Failed to handle vote' }, { status: 500 });
  }
}
