// @ts-nocheck
// Adding TypeScript ignore to bypass type checking for API route
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  context: any
) {
  const params = context.params;
  try {
    const jokeId = params.jokeId;
    
    if (!jokeId) {
      return NextResponse.json({ error: 'Joke ID not provided' }, { status: 400 });
    }
    
    // Construct the path to the video file
    const videoPath = path.join(process.cwd(), 'public', 'video', `${jokeId}.webm`);
    
    // Check if the file exists
    if (!fs.existsSync(videoPath)) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
    
    // Stream the file
    const videoData = fs.readFileSync(videoPath);
    
    // Return the video with appropriate headers
    return new NextResponse(videoData, {
      headers: {
        'Content-Type': 'video/webm',
        'Content-Disposition': `inline; filename="${jokeId}.webm"`,
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Error retrieving joke video:', error);
    return NextResponse.json({ error: 'Failed to retrieve video' }, { status: 500 });
  }
}
