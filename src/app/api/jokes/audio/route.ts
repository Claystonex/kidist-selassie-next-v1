import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const jokeContent = formData.get('jokeContent') as string;
    const duration = parseInt(formData.get('duration') as string || '0');
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    if (!jokeContent || jokeContent.trim() === '') {
      return NextResponse.json({ error: 'No joke content provided' }, { status: 400 });
    }

    // Generate a unique filename
    const filename = `${userId}-${Date.now()}.webm`;
    
    // Get user info for the joke attribution
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        nickname: true,
      }
    });
    
    const userName = user?.nickname || 
                    [user?.firstName, user?.lastName]
                      .filter(Boolean)
                      .join(' ') || 
                    'Anonymous';

    // Store the audio in the database (using Neon)
    // Read the audio file as an ArrayBuffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a joke with audio attachment
    const jokeId = uuidv4();
    
    // Create the joke entry
    const joke = await prisma.$transaction(async (tx) => {
      // 1. Create joke entry
      // Access model with lowercase name using type casting to bypass TypeScript errors
      const newJoke = await (tx as any).joke.create({
        data: {
          id: jokeId,
          content: jokeContent,
          userName: userName,
          timestamp: new Date().toISOString(),
        }
      });
      
      // 2. Create attachment for the audio
      // Create attachment without audioData field - we'll update it after
      const attachment = await tx.attachment.create({
        data: {
          fileName: filename,
          fileUrl: '', // We'll store the audio data in a binary column instead of a URL
          fileType: 'AUDIO',
          postId: newJoke.id, // Using the joke ID as a link
        }
      });
      
      // Update with raw query to set the binary data
      // Use raw query to set binary data since Prisma doesn't have native support for it in the client
      await tx.$executeRaw`UPDATE "Attachment" SET "audioData" = ${buffer}, "audioDuration" = ${duration} WHERE id = ${attachment.id}`;
      return newJoke;
    });
    
    return NextResponse.json({ 
      success: true,
      jokeId: joke.id
    });
    
  } catch (error: any) {
    console.error('Error uploading audio joke:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
