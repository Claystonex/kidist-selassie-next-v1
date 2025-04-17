// File: /app/api/jokes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Helper to get audio URL for jokes
const getAudioUrl = (jokeId: string) => {
  return `/api/jokes/audio/${jokeId}`;
};

// Helper to get video URL for jokes
const getVideoUrl = (jokeId: string) => {
  return `/api/jokes/video/${jokeId}`;
};

// GET handler - Get all jokes
export async function GET(request: NextRequest) {
  try {
    // Get jokes from database with attachments - use type casting to bypass TS errors
    const jokes = await (prisma as any).joke.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    // Add audio and video URLs directly to jokes
    const jokesWithMedia = jokes.map((joke: any) => {
      return {
        ...joke,
        hasAudio: joke.hasAudio || false,
        audioUrl: joke.hasAudio ? getAudioUrl(joke.id) : null,
        audioDuration: joke.audioDuration || 0,
        hasVideo: joke.hasVideo || false,
        videoUrl: joke.hasVideo ? getVideoUrl(joke.id) : null,
        videoDuration: joke.videoDuration || 0
      };
    });
    
    return NextResponse.json(jokesWithMedia);
  } catch (error) {
    console.error('Error retrieving jokes:', error);
    return NextResponse.json({ error: 'Failed to retrieve jokes' }, { status: 500 });
  }
}

// POST handler - Add a new joke
export async function POST(request: NextRequest) {
  try {
    // Check if request is multipart form data (has audio) or JSON
    const contentType = request.headers.get('content-type') || '';
    
    // Get user information from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    
    // Handle multipart form data (with audio)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const jokeContent = formData.get('jokeContent') as string;
      const audioFile = formData.get('audio') as File;
      const duration = parseInt(formData.get('duration') as string || '0');
      
      // Validate required fields
      if (!jokeContent || jokeContent.trim() === '') {
        return NextResponse.json({ error: 'Joke content is required' }, { status: 400 });
      }
      
      if (!audioFile) {
        return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
      }
      
      // Generate a unique filename
      const filename = `${userId}-${Date.now()}.webm`;
      
      // Read the audio file as an ArrayBuffer
      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Store the joke directly with hasAudio flag
      const joke = await (prisma as any).joke.create({
        data: {
          content: jokeContent,
          userName: userName,
          timestamp: new Date().toISOString(),
          hasAudio: true,          // Store flag directly in joke record
          audioDuration: duration,  // Store duration directly in joke record
        }
      });
      
      // Store the audio data separately with the joke ID as the key
      // We'll create a separate endpoint for this
      
      return NextResponse.json(joke, { status: 201 });
    } 
    // Handle regular JSON request (no audio)
    else {
      // Parse the JSON request body
      let body;
      try {
        body = await request.json();
      } catch (parseError) {
        console.error('Failed to parse request body as JSON:', parseError);
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
      }
      
      const { content } = body;
      
      // Validate required fields
      if (!content || content.trim() === '') {
        return NextResponse.json({ error: 'Joke content is required' }, { status: 400 });
      }
      
      // Create a joke without audio
      const joke = await (prisma as any).joke.create({
        data: {
          content: content,
          userName: userName,
          timestamp: new Date().toISOString(),
        }
      });
      
      return NextResponse.json({
        ...joke,
        hasAudio: false,
        audioUrl: null,
        audioDuration: 0,
        hasVideo: false,
        videoUrl: null,
        videoDuration: 0
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Joke API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
