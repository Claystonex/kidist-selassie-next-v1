// File: /app/api/gallery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Vimeo from '@vimeo/vimeo';

// Change file location to public directory, which is accessible by all serverless functions
const GALLERY_FILE = path.join(process.cwd(), 'public', 'data', 'gallery.json');

// Initialize Vimeo client
const vimeoClient = new Vimeo.Vimeo(
  process.env.VIMEO_CLIENT_ID || '',
  process.env.VIMEO_CLIENT_SECRET || '',
  process.env.VIMEO_ACCESS_TOKEN || ''
);

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
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const mediaUrl = formData.get('mediaUrl') as string;
    const thumbnailUrl = formData.get('thumbnailUrl') as string;
    const vimeoUrl = formData.get('vimeoUrl') as string; // New field for Vimeo videos
    const category = formData.get('category') as string;
    const password = formData.get('password') as string;
    
    // Validate password
    if (password !== process.env.VERSE_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }
    
    // For videos, vimeoUrl is required
    // For images and other types, mediaUrl is required
    if (type === 'video' && !vimeoUrl) {
      return NextResponse.json({ error: 'Vimeo URL is required for videos' }, { status: 400 });
    } else if (type !== 'video' && !mediaUrl) {
      return NextResponse.json({ error: 'Media URL is required' }, { status: 400 });
    }
    
    // Category is optional, but recommended
    const safeCategory = category || 'Uncategorized';
    
    // Prepare the response item
    let newItem: any = {
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
      const vimeoIdMatch = vimeoUrl.match(/vimeo\.com\/(\d+)/);
      if (!vimeoIdMatch || !vimeoIdMatch[1]) {
        return NextResponse.json({ error: 'Invalid Vimeo URL format. Expected: https://vimeo.com/123456789' }, { status: 400 });
      }
      
      const vimeoId = vimeoIdMatch[1]; // Now TypeScript knows this is defined
      
      // Get video details from Vimeo
      try {
        const vimeoDetails = await getVimeoVideoDetails(vimeoId);
        
        // Add Vimeo-specific details
        newItem.vimeoId = vimeoId;
        newItem.mediaUrl = vimeoUrl;
        newItem.thumbnailUrl = vimeoDetails.pictures.sizes[3].link; // Medium size thumbnail
        newItem.embedUrl = vimeoDetails.embed.html;
        newItem.duration = vimeoDetails.duration;
      } catch (vimeoError) {
        console.error('Vimeo API error:', vimeoError);
        return NextResponse.json({ error: 'Failed to fetch video details from Vimeo' }, { status: 500 });
      }
    } else {
      // For images and other non-video types
      newItem.mediaUrl = mediaUrl;
      // Set thumbnail URL with fallback to media URL or default placeholder
      if (thumbnailUrl) {
        newItem.thumbnailUrl = thumbnailUrl;
      } else if (mediaUrl) {
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
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error adding gallery item:', error);
    return NextResponse.json({ error: 'Failed to add gallery item' }, { status: 500 });
  }
}

// DELETE handler - Delete a gallery item
export async function DELETE(request: NextRequest) {
  ensureDataDir();
  
  try {
    const body = await request.json();
    const { id, password } = body;
    
    // Validate password
    if (password !== process.env.VERSE_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!id) {
      return NextResponse.json({ error: 'Gallery item ID is required' }, { status: 400 });
    }
    
    const galleryData = fs.readFileSync(GALLERY_FILE, 'utf8');
    let galleryItems = JSON.parse(galleryData);
    
    galleryItems = galleryItems.filter((item: any) => item.id !== id);
    fs.writeFileSync(GALLERY_FILE, JSON.stringify(galleryItems, null, 2));
    
    return NextResponse.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete gallery item' }, { status: 500 });
  }
}
