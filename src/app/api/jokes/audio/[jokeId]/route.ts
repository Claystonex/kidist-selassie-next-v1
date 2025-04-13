import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

// This endpoint serves audio files for jokes
export async function GET(
  request: NextRequest,
  context: { params: { jokeId: string } }
) {
  const { params } = context;
  try {
    const jokeId = params.jokeId;
    
    if (!jokeId) {
      return NextResponse.json({ error: 'Joke ID is required' }, { status: 400 });
    }
    
    // Verify the joke exists and has audio
    const joke = await (prisma as any).joke.findUnique({
      where: { id: jokeId },
    });
    
    if (!joke || !joke.hasAudio) {
      return NextResponse.json({ error: 'Audio joke not found' }, { status: 404 });
    }
    
    // Get audio file path
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    const filePath = path.join(audioDir, `${jokeId}.webm`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
    }
    
    // Read the audio file
    const audioData = fs.readFileSync(filePath);
    
    // Create headers for the audio response
    const headers = new Headers();
    headers.set('Content-Type', 'audio/webm');
    headers.set('Content-Disposition', `inline; filename="${jokeId}.webm"`);
    
    // Return the audio data
    return new NextResponse(audioData, {
      status: 200,
      headers,
    });
    
  } catch (error) {
    console.error('Error retrieving audio:', error);
    return NextResponse.json({ error: 'Failed to retrieve audio' }, { status: 500 });
  }
}
