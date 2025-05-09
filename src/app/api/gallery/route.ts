// File: /app/api/gallery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Vimeo, { VimeoError, VimeoResponse } from '@vimeo/vimeo';
import fs from 'fs';
import path from 'path';

// Initialize Prisma client (commented out as we're using file-based storage)
// const prisma = new PrismaClient();

// Change file location to public directory, which is accessible by all serverless functions
const GALLERY_FILE = path.join(process.cwd(), 'public', 'data', 'gallery.json');

// Initialize Vimeo client
const vimeoClient = new Vimeo.Vimeo(
  process.env.VIMEO_CLIENT_ID || '',
  process.env.VIMEO_CLIENT_SECRET || '',
  process.env.VIMEO_ACCESS_TOKEN || ''
);

// Helper function to extract Vimeo ID from URL
const extractVimeoId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // Match patterns like https://vimeo.com/123456789 or https://player.vimeo.com/video/123456789
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Ensure the data directory exists in public folder
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true }); // Using recursive to create nested directories if needed
  }
  if (!fs.existsSync(GALLERY_FILE)) {
    fs.writeFileSync(GALLERY_FILE, JSON.stringify([]));
  }
};

// Using the VimeoError interface from the type definitions

// Helper function to get video data from Vimeo
const getVimeoVideoDetails = (videoId: string): Promise<VimeoResponse> => {
  return new Promise((resolve, reject) => {
    vimeoClient.request({
      method: 'GET',
      path: `/videos/${videoId}`
    }, (error: VimeoError | null, body: VimeoResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
};

// GET handler - Get all gallery items or filtered by type
export async function GET(request: NextRequest) {
  ensureDataDir();
  
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const type = searchParams.get('type'); // 'image', 'video', 'audio'
  const category = searchParams.get('category');
  
  try {
    const galleryData = fs.readFileSync(GALLERY_FILE, 'utf8');
    let galleryItems = JSON.parse(galleryData);
    
    // If ID is provided, return that specific item
    if (id) {
      const item = galleryItems.find((item: any) => item.id === id);
      if (!item) {
        return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
      }
      return NextResponse.json(item);
    }
    
    // If type is provided, filter by type
    if (type) {
      galleryItems = galleryItems.filter((item: any) => item.type === type);
    }
    // If category is provided, filter by category
    if (category) {
      galleryItems = galleryItems.filter((item: any) => item.category === category);
    }
    
    // Sort by latest first
    galleryItems.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json(galleryItems);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve gallery items' }, { status: 500 });
  }
}

// POST handler - Add a new gallery item
export async function POST(request: NextRequest) {
  ensureDataDir();
  
  try {
    console.log('Gallery POST request received');
    
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const mediaUrl = formData.get('mediaUrl') as string;
    const thumbnailUrl = formData.get('thumbnailUrl') as string;
    const vimeoUrl = formData.get('vimeoUrl') as string; // Field for Vimeo videos
    const category = formData.get('category') as string;
    const password = formData.get('password') as string;
    
    console.log('Received gallery item:', { title, type, category });
    
    // Validate password
    if (password !== process.env.VERSE_PASSWORD) {
      console.log('Gallery add: password validation failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }
    
    // Category is optional, but recommended
    const safeCategory = category || 'Uncategorized';
    
    // Create new gallery item using file-based approach
    const newItem: any = {
      id: Date.now().toString(),
      title,
      description: description || '',
      type,
      category: safeCategory,
      uploader: 'Selassie Youth',
      createdAt: new Date().toISOString()
    };
    
    // Handle different media types
    if (type === 'video' && vimeoUrl) {
      // Extract Vimeo ID from URL
      const vimeoId = extractVimeoId(vimeoUrl);
      if (!vimeoId) {
        return NextResponse.json({ 
          error: 'Invalid Vimeo URL format. Expected: https://vimeo.com/123456789' 
        }, { status: 400 });
      }
      
      // Get video details from Vimeo
      try {
        console.log('Fetching Vimeo details for ID:', vimeoId);
        const vimeoDetails = await getVimeoVideoDetails(vimeoId);
        
        // Add Vimeo-specific details
        newItem.vimeoId = vimeoId;
        newItem.vimeoUrl = vimeoUrl;
        newItem.thumbnailUrl = vimeoDetails.pictures.sizes[3].link; // Medium size thumbnail
        newItem.duration = vimeoDetails.duration;
      } catch (vimeoError) {
        console.error('Vimeo API error:', vimeoError);
        return NextResponse.json({ error: 'Failed to fetch video details from Vimeo' }, { status: 500 });
      }
    } else {
      // Handle image or audio URLs
      newItem.mediaUrl = mediaUrl;
      
      // Set thumbnail URL
      if (thumbnailUrl) {
        newItem.thumbnailUrl = thumbnailUrl;
      } else if (mediaUrl && type === 'image') {
        newItem.thumbnailUrl = mediaUrl;
      } else if (type === 'audio') {
        newItem.thumbnailUrl = '/images/audio-placeholder.png';
      } else {
        // Default placeholder for any other type
        newItem.thumbnailUrl = '/images/media-placeholder.png';
      }
    }
    
    // Add to gallery JSON file
    const galleryData = fs.readFileSync(GALLERY_FILE, 'utf8');
    const galleryItems = JSON.parse(galleryData);
    
    galleryItems.push(newItem);
    fs.writeFileSync(GALLERY_FILE, JSON.stringify(galleryItems, null, 2));
    
    console.log('Gallery item created successfully:', newItem.id);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error adding gallery item:', error);
    return NextResponse.json({
      error: 'Failed to add gallery item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE handler - Delete a gallery item
export async function DELETE(request: NextRequest) {
  ensureDataDir();
  
  try {
    // Log the start of deletion process
    console.log('Gallery DELETE request received');
    
    // Parse the request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse DELETE request JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { id, password } = body;
    console.log('Deleting gallery item:', id);
    
    // Validate password
    if (password !== process.env.VERSE_PASSWORD) {
      console.log('Gallery delete: password validation failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!id) {
      console.log('Gallery delete: missing ID');
      return NextResponse.json({ error: 'Gallery item ID is required' }, { status: 400 });
    }
    
    // Try to read the gallery data file
    let galleryData, galleryItems;
    try {
      galleryData = fs.readFileSync(GALLERY_FILE, 'utf8');
      galleryItems = JSON.parse(galleryData);
      console.log(`Gallery file read successfully, contains ${galleryItems.length} items`);
    } catch (fileError) {
      console.error('Error reading gallery file:', fileError);
      return NextResponse.json({
        error: 'Failed to read gallery data',
        details: fileError instanceof Error ? fileError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Check if the item exists
    const originalLength = galleryItems.length;
    const itemToDelete = galleryItems.find((item: any) => item.id === id);
    
    if (!itemToDelete) {
      console.log(`Gallery item with ID ${id} not found`);
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }
    
    // Filter out the item to delete
    galleryItems = galleryItems.filter((item: any) => item.id !== id);
    
    // Verify the item was removed
    if (galleryItems.length === originalLength) {
      console.log('Warning: Gallery filter operation did not remove any items');
    } else {
      console.log(`Gallery item removed, new count: ${galleryItems.length}`);
    }
    
    // Save the updated gallery items back to the file
    try {
      fs.writeFileSync(GALLERY_FILE, JSON.stringify(galleryItems, null, 2));
      console.log('Gallery file updated successfully');
    } catch (writeError) {
      console.error('Error writing to gallery file:', writeError);
      return NextResponse.json({
        error: 'Failed to update gallery data',
        details: writeError instanceof Error ? writeError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      message: 'Gallery item deleted successfully',
      id: id,
      remainingItems: galleryItems.length
    });
  } catch (error) {
    console.error('Unhandled error in gallery delete:', error);
    return NextResponse.json({
      error: 'Failed to delete gallery item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
