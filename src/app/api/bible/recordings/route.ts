import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';

const prisma = new PrismaClient();

// Handle GET - Retrieve all recordings
export async function GET(request: NextRequest) {
  try {
    // Get query params for potential filtering
    const searchParams = request.nextUrl.searchParams;
    const bookId = searchParams.get('bookId');
    const chapterNumber = searchParams.get('chapterNumber');

    // Build filter object
    const filter: any = {};
    if (bookId) {
      filter.bookId = parseInt(bookId);
    }
    if (chapterNumber) {
      filter.chapterNumber = parseInt(chapterNumber);
    }

    // Fetch recordings from the database using Prisma's any type as a workaround
    // until Prisma schema is updated and generated
    const recordings = await (prisma as any).bibleRecording.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        bookId: true,
        bookName: true,
        chapterNumber: true,
        userId: true,
        userName: true,
        duration: true,
        fileUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json(recordings);
  } catch (error) {
    console.error('Error fetching Bible recordings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch Bible recordings' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Handle POST - Upload a new recording
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse the multipart/form-data request
    const formData = await request.formData();
    
    // Get form fields
    const audioFile = formData.get('audio') as File;
    const bookId = parseInt(formData.get('bookId') as string);
    const chapterNumber = parseInt(formData.get('chapterNumber') as string);
    const duration = parseInt(formData.get('duration') as string);
    const bookName = formData.get('bookName') as string;

    // Validate form fields
    if (!audioFile || !bookId || !chapterNumber || !bookName) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the file is a valid audio file
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { message: 'Invalid file type. Only audio files are allowed.' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const uniqueId = uuidv4();
    const fileExtension = audioFile.type === 'audio/webm' ? 'webm' : 'mp3';
    const fileName = `${uniqueId}.${fileExtension}`;
    
    // Create the uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'bible-recordings');
    await mkdir(uploadDir, { recursive: true });
    
    // Save the file path
    const filePath = path.join(uploadDir, fileName);
    
    // Convert audio file to buffer and save it
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    await writeFile(filePath, buffer);
    
    // Generate the URL for the uploaded file
    const fileUrl = `/uploads/bible-recordings/${fileName}`;

    // Store metadata in database using Prisma's any type as a workaround
    // until Prisma schema is updated and generated
    const recording = await (prisma as any).bibleRecording.create({
      data: {
        bookId,
        bookName,
        chapterNumber,
        userId: user.id,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        duration,
        fileUrl,
      },
    });

    return NextResponse.json(
      { message: 'Recording uploaded successfully', id: recording.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading Bible recording:', error);
    return NextResponse.json(
      { message: 'Failed to upload recording' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
