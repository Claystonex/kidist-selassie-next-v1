import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const password = formData.get('password') as string;
    
    // Validate password
    const adminPassword = 'Youth100';
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Get file extension and validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedAudioTypes = ['mp3', 'wav', 'ogg', 'm4a'];
    const allowedVideoTypes = ['mp4', 'webm', 'mov'];
    
    if (![...allowedAudioTypes, ...allowedVideoTypes].includes(fileExtension || '')) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed types: mp3, wav, ogg, m4a, mp4, webm, mov' 
      }, { status: 400 });
    }

    // Determine media type based on file extension
    const mediaType = allowedAudioTypes.includes(fileExtension || '') ? 'audio' : 'video';
    
    // Create unique filename
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const mediaFolder = mediaType === 'audio' ? 'audio' : 'video';
    
    // Ensure directory exists
    const uploadDir = join(process.cwd(), 'public', 'media', mediaFolder);
    
    try {
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Write file to disk
      await writeFile(join(uploadDir, uniqueFilename), buffer);
      
      // Generate URL path
      const fileUrl = `/media/${mediaFolder}/${uniqueFilename}`;
      
      return NextResponse.json({ 
        success: true, 
        mediaType,
        fileUrl,
        fileName: file.name,
        size: file.size
      });
    } catch (error) {
      console.error('File write error:', error);
      return NextResponse.json({ error: 'Failed to save the file' }, { status: 500 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 });
  }
}
