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

// Debug log
console.log('Verses add API initialized with Prisma');



// POST handler to add a new verse
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
    
    console.log('Received verse submission:', { title, hasPassword: !!password });
    
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
    
    try {
      // Create the verse directly in the database using Prisma
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
    console.error('Verse add API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process verse',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    // Always disconnect Prisma client to prevent connection pool issues
    await prisma.$disconnect();
  }
}
