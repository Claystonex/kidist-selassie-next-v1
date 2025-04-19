// File: /app/api/teachings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Vimeo from '@vimeo/vimeo';

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Vimeo client
const vimeoClient = new Vimeo.Vimeo(
  process.env.VIMEO_CLIENT_ID || '',
  process.env.VIMEO_CLIENT_SECRET || '',
  process.env.VIMEO_ACCESS_TOKEN || ''
);

// Helper function to get video data from Vimeo
const getVimeoVideoDetails = (videoId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    vimeoClient.request({
      method: 'GET',
      path: `/videos/${videoId}`
    }, (error, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
};

// GET handler - Get all teachings or a specific teaching
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (id) {
      // Get specific teaching by ID
      // @ts-ignore - Suppressing TypeScript error for new model
      const teaching = await prisma.teaching.findUnique({
        where: { id }
      });
      
      if (!teaching) {
        return NextResponse.json({ error: 'Teaching not found' }, { status: 404 });
      }
      
      return NextResponse.json(teaching);
    } else {
      // Get all teachings, sorted by newest first
      // @ts-ignore - Suppressing TypeScript error for new model
      const teachings = await prisma.teaching.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return NextResponse.json(teachings);
    }
  } catch (error) {
    console.error('Error retrieving teachings:', error);
    return NextResponse.json({ error: 'Failed to retrieve teachings' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST handler - Add a new teaching
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      priestName, 
      mediaType,
      mediaUrl, 
      category, 
      password 
    } = body;
    
    // Check against hardcoded password 'Youth100'
    const adminPassword = 'Youth100';
    
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }
    
    // Validate required fields
    if (!title || !priestName || !mediaUrl || !mediaType) {
      return NextResponse.json({ 
        error: 'Title, priest name, media type, and media URL are required' 
      }, { status: 400 });
    }
    
    let vimeoId = null;
    let thumbnailUrl = null;
    let duration = null;
    
    // If it's a Vimeo video, extract details
    if (mediaType === 'video' && mediaUrl.includes('vimeo.com')) {
      // Extract Vimeo video ID from URL
      const vimeoIdMatch = mediaUrl.match(/vimeo\.com\/(\d+)/);
      if (!vimeoIdMatch) {
        return NextResponse.json({ error: 'Invalid Vimeo URL' }, { status: 400 });
      }
      
      vimeoId = vimeoIdMatch[1];
      
      // Get video details from Vimeo
      try {
        const vimeoDetails = await getVimeoVideoDetails(vimeoId);
        thumbnailUrl = vimeoDetails.pictures.sizes[3].link; // Medium size thumbnail
        duration = vimeoDetails.duration;
      } catch (vimeoError) {
        console.error('Vimeo API error:', vimeoError);
        return NextResponse.json({ 
          error: 'Failed to fetch video details from Vimeo' 
        }, { status: 500 });
      }
    }
    
    // Create the teaching record
    try {
      // @ts-ignore - Suppressing TypeScript error for new model
      const newTeaching = await prisma.teaching.create({
        data: {
          title,
          description: description || '',
          priestName,
          mediaType,
          mediaUrl,
          vimeoId,
          thumbnailUrl,
          duration,
          category: category || 'Uncategorized'
        }
      });
      
      return NextResponse.json(newTeaching, { status: 201 });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        error: 'Failed to save teaching to database',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Teaching API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE handler - Delete a teaching
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, password } = body;
    
    // Check against hardcoded password 'Youth100'
    const adminPassword = 'Youth100';
    
    if (password !== adminPassword) {
      return NextResponse.json({ 
        error: 'Incorrect password' 
      }, { status: 401 });
    }
    
    if (!id) {
      return NextResponse.json({ error: 'Teaching ID is required' }, { status: 400 });
    }
    
    try {
      // Check if teaching exists before attempting to delete
      // @ts-ignore - Suppressing TypeScript error for new model
      const teaching = await prisma.teaching.findUnique({
        where: { id }
      });
      
      if (!teaching) {
        return NextResponse.json({ error: 'Teaching not found' }, { status: 404 });
      }
      
      // Delete the teaching from the database
      // @ts-ignore - Suppressing TypeScript error for new model
      await prisma.teaching.delete({
        where: { id }
      });
      
      return NextResponse.json({ message: 'Teaching deleted successfully' });
    } catch (dbError) {
      console.error('Database error during delete operation:', dbError);
      return NextResponse.json({ 
        error: 'Failed to delete teaching from database',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Teaching delete API error:', error);
    return NextResponse.json({ error: 'Failed to process delete request' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
