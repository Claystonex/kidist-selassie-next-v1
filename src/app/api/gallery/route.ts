// File: /app/api/gallery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

// Change file location to public directory, which is accessible by all serverless functions
const GALLERY_FILE = path.join(process.cwd(), 'public', 'data', 'gallery.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'gallery');

// Ensure the data directory exists in public folder
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true }); // Using recursive to create nested directories if needed
  }
  if (!fs.existsSync(GALLERY_FILE)) {
    fs.writeFileSync(GALLERY_FILE, JSON.stringify([]));
  }
  
  // Also ensure uploads directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
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
    const mediaFile = formData.get('mediaFile') as File;
    const thumbnailFile = formData.get('thumbnailFile') as File;
    const mediaUrl = formData.get('mediaUrl') as string;
    const thumbnailUrl = formData.get('thumbnailUrl') as string;
    const category = formData.get('category') as string;
    const password = formData.get('password') as string;
    
    // Validate password
    if (password !== process.env.VERSE_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }
    
    // Either media file or URL must be provided
    if (!mediaFile && !mediaUrl) {
      return NextResponse.json({ error: 'Either media file or URL must be provided' }, { status: 400 });
    }
    
    // Category is optional, but recommended
    const safeCategory = category || 'Uncategorized';
    
    // Handle file uploads if provided
    let finalMediaUrl = mediaUrl;
    let finalThumbnailUrl = thumbnailUrl;
    
    // If mediaFile is provided, save it
    if (mediaFile) {
      const mediaBytes = await mediaFile.arrayBuffer();
      const mediaBuffer = Buffer.from(mediaBytes);
      const mediaFilename = `${Date.now()}-${mediaFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const mediaPath = path.join(UPLOADS_DIR, mediaFilename);
      
      await writeFile(mediaPath, mediaBuffer);
      finalMediaUrl = `/uploads/gallery/${mediaFilename}`;
    }
    
    // If thumbnailFile is provided, save it
    if (thumbnailFile) {
      const thumbBytes = await thumbnailFile.arrayBuffer();
      const thumbBuffer = Buffer.from(thumbBytes);
      const thumbFilename = `thumb-${Date.now()}-${thumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const thumbPath = path.join(UPLOADS_DIR, thumbFilename);
      
      await writeFile(thumbPath, thumbBuffer);
      finalThumbnailUrl = `/uploads/gallery/${thumbFilename}`;
    }
    
    // Set default thumbnail for non-image types if none provided
    if (!finalThumbnailUrl) {
      if (type === 'audio') {
        finalThumbnailUrl = '/images/audio-placeholder.png'; // Default audio thumbnail
      } else if (type === 'video') {
        finalThumbnailUrl = '/images/video-placeholder.png'; // Default video thumbnail
      } else {
        finalThumbnailUrl = finalMediaUrl; // For images, use the same URL
      }
    }
    
    const galleryData = fs.readFileSync(GALLERY_FILE, 'utf8');
    const galleryItems = JSON.parse(galleryData);
    
    const newItem = {
      id: Date.now().toString(),
      title,
      description: description || '',
      type, // 'image', 'video', 'audio'
      mediaUrl: finalMediaUrl,
      thumbnailUrl: finalThumbnailUrl,
      category: safeCategory,
      uploader: 'Selassie Youth',
      createdAt: new Date().toISOString()
    };
    
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
