import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const MEDIA_DIR = path.join(process.cwd(), 'public', 'forum-media');

// Ensure media directory exists for local file uploads
function ensureMediaDir() {
  try {
    console.log('ensureMediaDir: Checking media directory:', MEDIA_DIR);
    if (!fs.existsSync(MEDIA_DIR)) {
      console.log('ensureMediaDir: Creating media directory');
      fs.mkdirSync(MEDIA_DIR, { recursive: true });
    }
    console.log('ensureMediaDir: Media directory verified');
  } catch (error) {
    console.error('Error in ensureMediaDir:', error);
    throw error;
  }
}

// GET handler - Get all admin posts
export async function GET(request: NextRequest) {
  console.log('GET: Forum admin endpoint called');
  
  try {
    // Fetch admin posts from database
    console.log('GET: Fetching admin posts from database');
    const posts = await prisma.forumPost.findMany({
      where: {
        isAdmin: { equals: true } as any
      },
      include: {
        attachments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
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
    console.log('POST: Parsing form data');
    const formData = await request.formData();
    console.log('POST: Form data received, extracting fields');
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const password = formData.get('password') as string;
    const mediaFile = formData.get('media') as File | null;
    
    console.log('POST: Fields extracted', { 
      hasTitle: !!title, 
      hasContent: !!content, 
      hasCategory: !!category,
      hasPassword: !!password,
      hasMedia: !!mediaFile
    });
    
    // Validate password
    if (password !== process.env.VERSE_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    // Map category to PostType enum
    const postType = mapCategoryToPostType(category);
    
    // Create transaction to ensure post and attachment are created together
    const newPost = await prisma.$transaction(async (tx) => {
      // Find the first user in the database to use as the author for admin posts
      // In a real-world scenario, you would have a dedicated system user or admin user
      const adminUser = await tx.user.findFirst();
      
      if (!adminUser) {
        throw new Error('No users found in the database. Cannot create admin post.');
      }
      
      // Create the forum post
      const post = await tx.forumPost.create({
        data: {
          title,
          content,
          type: postType,
          isAdmin: true as any,
          // Using the first user as the author for admin posts
          authorId: adminUser.id
        }
      });
      
      // Handle media file upload if present
      if (mediaFile && typeof mediaFile.arrayBuffer === 'function') {
        // Ensure media directory exists for local uploads
        ensureMediaDir();
        
        const buffer = Buffer.from(await mediaFile.arrayBuffer());
        const fileType = mediaFile.type || '';
        const fileTypeEnum = fileType.startsWith('audio') ? 'AUDIO' : 'OTHER';
        
        const fileName = `${Date.now()}_${mediaFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const filePath = path.join(MEDIA_DIR, fileName);
        
        // Write file to local filesystem
        fs.writeFileSync(filePath, buffer);
        const fileUrl = `/forum-media/${fileName}`;
        
        // Create attachment record in database
        await tx.attachment.create({
          data: {
            fileName,
            fileUrl,
            fileType: fileTypeEnum,
            postId: post.id,
            audioDuration: fileTypeEnum === 'AUDIO' ? 0 : null // Default duration or calculate actual duration
          }
        });
      }
      
      return post;
    });
    
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
    
    // First fetch the post to check if it exists and get its attachments
    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: { attachments: true }
    });
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Delete any media files in the local filesystem if they exist
    for (const attachment of post.attachments) {
      if (attachment.fileUrl && attachment.fileUrl.startsWith('/forum-media/')) {
        const fileName = attachment.fileUrl.split('/').pop();
        if (fileName) {
          const filePath = path.join(MEDIA_DIR, fileName);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
    }
    
    // Delete the post (cascade delete will remove attachments too)
    await prisma.forumPost.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting post:', error?.message || error);
    return NextResponse.json({ error: 'Failed to delete post: ' + (error?.message || 'Unknown error') }, { status: 500 });
  }
}

// Helper function to map category to PostType enum
function mapCategoryToPostType(category: string) {
  switch (category.toLowerCase()) {
    case 'announcements':
      return 'GENERAL_DISCUSSION';
    case 'q&a':
      return 'EDUCATIONAL';
    case 'events':
      return 'GENERAL_DISCUSSION';
    case 'testimonies':
      return 'DAILY_INSPIRATION';
    case 'humor':
      return 'HUMOR';
    default:
      return 'GENERAL_DISCUSSION';
  }
}
