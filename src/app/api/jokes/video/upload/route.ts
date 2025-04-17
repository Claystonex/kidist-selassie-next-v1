import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Create video directory if it doesn't exist
const ensureVideoDir = () => {
  const videoDir = path.join(process.cwd(), 'public', 'video');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }
  return videoDir;
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = await req.formData();
    const videoFile = formData.get('video') as File;
    const jokeContent = formData.get('jokeContent') as string;
    const duration = parseInt(formData.get('duration') as string || '0');
    
    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
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
        content: jokeContent || 'Video joke',
        userName: userName,
        timestamp: new Date().toISOString(),
        hasVideo: true,
        videoDuration: duration
      }
    });

    // Read and save the video file to disk
    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Ensure the video directory exists
    const videoDir = ensureVideoDir();
    
    // Create a filename using the joke ID
    const filename = `${joke.id}.webm`;
    const filePath = path.join(videoDir, filename);
    
    // Write the file to disk
    fs.writeFileSync(filePath, buffer);
    
    return NextResponse.json({ 
      success: true,
      joke
    });
    
  } catch (error: any) {
    console.error('Error uploading video joke:', error);
    return NextResponse.json({ 
      error: 'Failed to process video joke', 
      details: error.message 
    }, { status: 500 });
  }
}
