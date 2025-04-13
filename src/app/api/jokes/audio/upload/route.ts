import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Create audio directory if it doesn't exist
const ensureAudioDir = () => {
  const audioDir = path.join(process.cwd(), 'public', 'audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }
  return audioDir;
};

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

    // Get user info for attribution
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

    // Generate unique ID for the joke
    const jokeId = uuidv4();
    
    // Create joke entry first
    const joke = await (prisma as any).joke.create({
      data: {
        id: jokeId,
        content: jokeContent || 'Voice joke',
        userName: userName,
        timestamp: new Date().toISOString(),
        hasAudio: true,
        audioDuration: duration
      }
    });

    // Read and save the audio file to disk
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Ensure the audio directory exists
    const audioDir = ensureAudioDir();
    
    // Create a filename using the joke ID
    const filename = `${joke.id}.webm`;
    const filePath = path.join(audioDir, filename);
    
    // Write the file to disk
    fs.writeFileSync(filePath, buffer);
    
    return NextResponse.json({ 
      success: true,
      joke
    });
    
  } catch (error: any) {
    console.error('Error uploading audio joke:', error);
    return NextResponse.json({ 
      error: 'Failed to process audio joke', 
      details: error.message 
    }, { status: 500 });
  }
}
