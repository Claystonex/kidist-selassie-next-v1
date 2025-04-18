// File: /app/api/verses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Workaround for TypeScript not recognizing new models
// This tells TypeScript that our PrismaClient has the dailyVerse property
interface CustomPrismaClient extends PrismaClient {
  dailyVerse: {
    create: (args: { data: { title: string; scripture: string } }) => Promise<any>;
    findMany: (args?: any) => Promise<any[]>;
    findFirst: (args?: any) => Promise<any | null>;
    findUnique: (args?: any) => Promise<any | null>;
    delete: (args?: any) => Promise<any>;
  };
}

// Initialize Prisma client with type assertion
const prisma = new PrismaClient() as CustomPrismaClient;

// Debug information
console.log('Verses API initialized with Prisma');



// GET handler - Get the latest verse or all verses
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const all = searchParams.get('all');
    
    // Use Prisma to fetch verse(s) from the database
    if (all === 'true') {
      // Get all verses ordered by creation date (newest last)
      const verses = await prisma.dailyVerse.findMany({
        orderBy: {
          createdAt: 'asc'
        }
      });
      
      return NextResponse.json(verses);
    } else {
      // Get just the latest verse
      const latestVerse = await prisma.dailyVerse.findFirst({
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return NextResponse.json(latestVerse);
    }
  } catch (error) {
    console.error('Error retrieving verse(s):', error);
    return NextResponse.json({ error: 'Failed to retrieve verse data' }, { status: 500 });
  } finally {
    // Always disconnect Prisma client to prevent connection pool issues
    await prisma.$disconnect();
  }
}

// POST handler - Add a new verse
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body as JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { title, scripture, password } = body;
    
    // Use hardcoded password for now
    const expectedPassword = 'Youth100';
    
    // Check password
    if (password !== expectedPassword) {
      console.log('Password verification failed');
      return NextResponse.json({ error: 'Unauthorized - Incorrect password' }, { status: 401 });
    }
    
    // Validate required fields
    if (!title || !scripture) {
      return NextResponse.json({ error: 'Title and scripture are required' }, { status: 400 });
    }
    
    // Create the verse directly in the database using Prisma
    try {
      const newVerse = await prisma.dailyVerse.create({
        data: {
          title,
          scripture
          // createdAt and updatedAt will be automatically set by Prisma
        }
      });
      
      console.log('Verse added successfully:', newVerse.id);
      return NextResponse.json({ 
        success: true, 
        message: 'Verse added successfully',
        verse: newVerse 
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        error: 'Failed to save verse to database',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Verse API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  } finally {
    // Always disconnect Prisma client to prevent connection pool issues
    await prisma.$disconnect();
  }
}

// DELETE handler - Delete a verse
export async function DELETE(request: NextRequest) {
  try {
    // Parse the request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body as JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { id, password } = body;
    
    // Use hardcoded password for now
    const expectedPassword = 'Youth100';
    
    // Check password
    if (password !== expectedPassword) {
      console.log('Password verification failed for delete operation');
      return NextResponse.json({ error: 'Unauthorized - Incorrect password' }, { status: 401 });
    }
    
    if (!id) {
      return NextResponse.json({ error: 'Verse ID is required' }, { status: 400 });
    }
    
    try {
      // Check if verse exists before attempting to delete
      const verse = await prisma.dailyVerse.findUnique({
        where: { id }
      });
      
      if (!verse) {
        return NextResponse.json({ error: 'Verse not found' }, { status: 404 });
      }
      
      // Delete the verse from the database
      await prisma.dailyVerse.delete({
        where: { id }
      });
      
      console.log('Verse deleted successfully:', id);
      return NextResponse.json({ message: 'Verse deleted successfully' });
    } catch (dbError) {
      console.error('Database error during delete operation:', dbError);
      return NextResponse.json({ 
        error: 'Failed to delete verse from database',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Verse delete API error:', error);
    return NextResponse.json({ error: 'Failed to process delete request' }, { status: 500 });
  } finally {
    // Always disconnect Prisma client to prevent connection pool issues
    await prisma.$disconnect();
  }
}