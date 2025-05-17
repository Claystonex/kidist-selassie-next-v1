import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Create audio directory if it doesn't exist
const ensureAudioDir = () => {
  try {
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(audioDir)) {
      console.log(`Creating audio directory at: ${audioDir}`);
      fs.mkdirSync(audioDir, { recursive: true });
    }
    return audioDir;
  } catch (error) {
    console.error('Error creating audio directory:', error);
    // Fallback to a different directory if creation fails
    const backupDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    return backupDir;
  }
};

export async function POST(req: NextRequest) {
  // Define these variables at the top level so they're available in catch blocks
  let userId: string | null = null;
  let jokeContent: string = '';
  let audioFile: File | null = null;
  let duration: number = 0;
  let userName: string = 'Anonymous';
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    // Make authentication optional - allow anonymous submissions
    
    const formData = await req.formData();
    audioFile = formData.get('audio') as File;
    jokeContent = formData.get('jokeContent') as string;
    duration = parseInt(formData.get('duration') as string || '0');
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Get user info for attribution if user is logged in
    let userName = 'Anonymous';
    
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          firstName: true,
          lastName: true,
          nickname: true,
        }
      });
      
      userName = user?.nickname || 
                  [user?.firstName, user?.lastName]
                    .filter(Boolean)
                    .join(' ') || 
                  'Anonymous';
    }

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
    try {
      fs.writeFileSync(filePath, buffer);
      console.log(`Successfully wrote audio file to: ${filePath}`);
    } catch (writeError) {
      console.error('Error writing audio file:', writeError);
      // Don't fail the entire request if file writing fails, but mark audio as unavailable
      await (prisma as any).joke.update({
        where: { id: jokeId },
        data: { hasAudio: false }
      });
      return NextResponse.json({ 
        success: true,
        joke: { ...joke, hasAudio: false },
        warning: 'Joke saved but audio storage failed'
      });
    }
    
    return NextResponse.json({ 
      success: true,
      joke
    });
    
  } catch (error: any) {
    console.error('Error uploading audio joke:', error);
    
    // Try to save the joke without audio if possible
    try {
      if (jokeContent) {
        // We already have a userName from above, or the default 'Anonymous'
        const textOnlyJoke = await (prisma as any).joke.create({
          data: {
            content: jokeContent,
            userName: userName, // Using the userName set earlier
            timestamp: new Date().toISOString(),
            hasAudio: false
          }
        });
        
        return NextResponse.json({ 
          success: true,
          joke: textOnlyJoke,
          warning: 'Audio upload failed, saved as text-only joke'
        });
      }
    } catch (fallbackError) {
      console.error('Failed to save text-only joke fallback:', fallbackError);
    }
    
    return NextResponse.json({ 
      error: 'Failed to process audio joke', 
      details: error.message 
    }, { status: 500 });
  }
}
