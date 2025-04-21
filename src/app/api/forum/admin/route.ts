import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const POSTS_FILE = path.join(process.cwd(), 'data', 'forum-posts.json');
const MEDIA_DIR = path.join(process.cwd(), 'public', 'forum-media');

// Ensure the data directory and posts file exist
function ensureDataDir() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    console.log('ensureDataDir: Checking data directory:', dataDir);
    
    if (!fs.existsSync(dataDir)) {
      console.log('ensureDataDir: Creating data directory');
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    console.log('ensureDataDir: Checking posts file:', POSTS_FILE);
    if (!fs.existsSync(POSTS_FILE)) {
      console.log('ensureDataDir: Creating empty posts file');
      fs.writeFileSync(POSTS_FILE, JSON.stringify([]));
    }
    
    console.log('ensureDataDir: Checking media directory:', MEDIA_DIR);
    // Ensure media directory exists
    if (!fs.existsSync(MEDIA_DIR)) {
      console.log('ensureDataDir: Creating media directory');
      fs.mkdirSync(MEDIA_DIR, { recursive: true });
    }
    console.log('ensureDataDir: All directories and files verified');
  } catch (error) {
    console.error('Error in ensureDataDir:', error);
    throw error; // Re-throw to be caught by the handler
  }
}

// GET handler - Get all admin posts
export async function GET(request: NextRequest) {
  console.log('GET: Forum admin endpoint called');
  
  try {
    console.log('GET: Ensuring data directory');
    ensureDataDir();
    console.log('GET: Reading posts file from', POSTS_FILE);
    const postsData = fs.readFileSync(POSTS_FILE, 'utf8');
    console.log('GET: Parsing posts data');
    let posts = JSON.parse(postsData);
    
    // Filter for admin posts only
    console.log('GET: Filtering admin posts');
    posts = posts.filter((post: any) => 
      post.author === 'Kidist Selassie Youth International Network'
    );
    
    console.log('GET: Returning posts, count:', posts.length);
    return NextResponse.json(posts);
  } catch (error: any) {
    console.error('Error fetching posts:', error?.message || error);
    return NextResponse.json({ error: 'Failed to retrieve posts: ' + (error?.message || 'Unknown error') }, { status: 500 });
  }
}

// POST handler - Add a new admin post
export async function POST(request: NextRequest) {
  console.log('POST: Forum admin endpoint called');
  
  try {
    console.log('POST: Ensuring data directory');
    ensureDataDir();
    
    console.log('POST: Parsing form data');
    const formData = await request.formData();
    console.log('POST: Form data received, extracting fields');
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const password = formData.get('password') as string;
    const author = formData.get('author') as string;
    const mediaFile = formData.get('media') as File | null;
    
    console.log('POST: Fields extracted', { 
      hasTitle: !!title, 
      hasContent: !!content, 
      hasCategory: !!category,
      hasPassword: !!password,
      hasAuthor: !!author,
      hasMedia: !!mediaFile
    });
    
    // Validate password
    if (password !== process.env.VERSE_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    let mediaUrl = '';
    let mediaType = '';
    
    // Handle media file upload if present
    if (mediaFile && typeof mediaFile.arrayBuffer === 'function') {
      const buffer = Buffer.from(await mediaFile.arrayBuffer());
      const fileType = mediaFile.type || '';
      mediaType = fileType.startsWith('audio') ? 'audio' : 'video';
      
      const ext = mediaFile.name.split('.').pop();
      const fileName = `${Date.now()}_${mediaFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filePath = path.join(MEDIA_DIR, fileName);
      
      fs.writeFileSync(filePath, buffer);
      mediaUrl = `/forum-media/${fileName}`;
    }
    
    // Load existing posts
    const postsData = fs.readFileSync(POSTS_FILE, 'utf8');
    const posts = JSON.parse(postsData);
    
    // Create new post
    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      category,
      author,
      mediaUrl,
      mediaType,
      createdAt: new Date().toISOString()
    };
    
    // Add to beginning of posts array
    posts.unshift(newPost);
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    
    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    console.error('Error adding post:', error?.message || error, error?.stack);
    return NextResponse.json({ 
      error: 'Failed to add post: ' + (error?.message || 'Unknown error')
    }, { status: 500 });
  }
}

// DELETE handler - Delete a post
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
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }
    
    // Load existing posts
    const postsData = fs.readFileSync(POSTS_FILE, 'utf8');
    let posts = JSON.parse(postsData);
    
    // Find post to delete
    const postToDelete = posts.find((post: any) => post.id === id);
    if (!postToDelete) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Delete media file if exists
    if (postToDelete.mediaUrl) {
      const fileName = postToDelete.mediaUrl.split('/').pop();
      const filePath = path.join(MEDIA_DIR, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Filter out deleted post
    posts = posts.filter((post: any) => post.id !== id);
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
