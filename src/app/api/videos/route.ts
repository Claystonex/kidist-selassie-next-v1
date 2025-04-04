// File: /app/api/videos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Vimeo from '@vimeo/vimeo';

const VIDEOS_FILE = path.join(process.cwd(), 'data', 'videos.json');

// Initialize Vimeo client
const vimeoClient = new Vimeo.Vimeo(
  process.env.VIMEO_CLIENT_ID || '',
  process.env.VIMEO_CLIENT_SECRET || '',
  process.env.VIMEO_ACCESS_TOKEN || ''
);

// Ensure the data directory and videos file exist
const ensureDataDir = () => {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  if (!fs.existsSync(VIDEOS_FILE)) {
    fs.writeFileSync(VIDEOS_FILE, JSON.stringify([]));
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

// GET handler - Get all videos or a specific video
export async function GET(request: NextRequest) {
  ensureDataDir();
  
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  try {
    const videosData = fs.readFileSync(VIDEOS_FILE, 'utf8');
    const videos = JSON.parse(videosData);
    
    if (id) {
      const video = videos.find((v: any) => v.id === id);
      if (!video) {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 });
      }
      return NextResponse.json(video);
    } else {
      return NextResponse.json(videos);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve videos' }, { status: 500 });
  }
}

// POST handler - Add a new video
export async function POST(request: NextRequest) {
  ensureDataDir();
  
  try {
    const body = await request.json();
    const { title, description, vimeoUrl, category, password } = body;
    
    // Validate password
    if (password !== process.env.VERSE_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!title || !vimeoUrl) {
      return NextResponse.json({ error: 'Title and Vimeo URL are required' }, { status: 400 });
    }
    
    // Extract Vimeo video ID from URL
    const vimeoIdMatch = vimeoUrl.match(/vimeo\.com\/(\d+)/);
    if (!vimeoIdMatch) {
      return NextResponse.json({ error: 'Invalid Vimeo URL' }, { status: 400 });
    }
    
    const vimeoId = vimeoIdMatch[1];
    
    // Get video details from Vimeo
    let vimeoDetails;
    try {
      vimeoDetails = await getVimeoVideoDetails(vimeoId);
    } catch (vimeoError) {
      console.error('Vimeo API error:', vimeoError);
      return NextResponse.json({ error: 'Failed to fetch video details from Vimeo' }, { status: 500 });
    }
    
    const videosData = fs.readFileSync(VIDEOS_FILE, 'utf8');
    const videos = JSON.parse(videosData);
    
    const newVideo = {
      id: Date.now().toString(),
      title,
      description: description || '',
      vimeoId,
      thumbnailUrl: vimeoDetails.pictures.sizes[3].link, // Medium size thumbnail
      embedUrl: vimeoDetails.embed.html,
      duration: vimeoDetails.duration,
      category: category || 'Uncategorized',
      createdAt: new Date().toISOString()
    };
    
    videos.push(newVideo);
    fs.writeFileSync(VIDEOS_FILE, JSON.stringify(videos, null, 2));
    
    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.error('Error adding video:', error);
    return NextResponse.json({ error: 'Failed to add video' }, { status: 500 });
  }
}

// DELETE handler - Delete a video
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
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }
    
    const videosData = fs.readFileSync(VIDEOS_FILE, 'utf8');
    let videos = JSON.parse(videosData);
    
    // Note: This only removes the reference from our database, not from Vimeo
    videos = videos.filter((video: any) => video.id !== id);
    fs.writeFileSync(VIDEOS_FILE, JSON.stringify(videos, null, 2));
    
    return NextResponse.json({ message: 'Video deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
