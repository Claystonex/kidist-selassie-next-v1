import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// POST /api/forum/vote
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await request.json();

    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId
        }
      }
    });

    if (existingVote) {
      // Remove vote if it exists
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

    return NextResponse.json({ voteCount });
  } catch (error) {
    console.error('Error handling vote:', error);
    return NextResponse.json({ error: 'Failed to handle vote' }, { status: 500 });
  }
}
