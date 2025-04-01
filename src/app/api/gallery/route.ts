// File: /app/api/gallery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GALLERY_FILE = path.join(process.cwd(), 'data', 'gallery.json');

// Ensure the data directory exists
const ensureDataDir = () => {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  if (!fs.existsSync(GALLERY_FILE)) {
    fs.writeFileSync(GALLERY_FILE, JSON.stringify([]));
  }
};

// GET handler - Get all gallery items or filtered by type
export async function GET(request: NextRequest) {
  ensureDataDir();
  
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const type = searchParams.get('type'); // 'image', 'video', 'audio'
  
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
    const password = formData.get('password') as string;
    
    // Validate password
    if (password !== process.env.VERSE_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!title || !type || !mediaUrl) {
      return NextResponse.json({ error: 'Title, type, and media URL are required' }, { status: 400 });
    }
    
    const galleryData = fs.readFileSync(GALLERY_FILE, 'utf8');
    const galleryItems = JSON.parse(galleryData);
    
    const newItem = {
      id: Date.now().toString(),
      title,
      description: description || '',
      type, // 'image', 'video', 'audio'
      mediaUrl,
      thumbnailUrl: thumbnailUrl || mediaUrl, // For images, mediaUrl and thumbnailUrl might be the same
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
