import { NextResponse } from 'next/server';
import { PrismaClient, PostType, FileType } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const validPostTypes: PostType[] = [
  'GENERAL_DISCUSSION',
  'ART_EXPRESSION',
  'EDUCATIONAL',
  'DAILY_INSPIRATION',
  'HUMOR',
  'CAREER_SUPPORT'
];

const prisma = new PrismaClient();

// Define interfaces for our response types
interface FormattedAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: FileType;
}

interface FormattedPost {
  id: string;
  title: string;
  content: string;
  type: PostType;
  votes: number;
  createdAt: string;
  author: {
    name: string;
    imageUrl: string | null;
  };
  attachments: FormattedAttachment[];
}

// GET /api/forum
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const sort = searchParams.get('sort') || 'newest';
    const typeParam = searchParams.get('type');
    const pageSize = 10;

    // Get total count for pagination
    const totalPosts = await prisma.forumPost.count({
      where: typeParam && typeParam !== 'all' && validPostTypes.includes(typeParam as PostType)
        ? { type: typeParam as PostType }
        : undefined
    });

    // Build the query
    const posts = await prisma.forumPost.findMany({
      where: typeParam && typeParam !== 'all' && validPostTypes.includes(typeParam as PostType)
        ? { type: typeParam as PostType }
        : undefined,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          }
        },
        attachments: true,
        votes: true,
      },
      orderBy: [{
        votes: {
          _count: sort === 'votes' ? 'desc' : 'asc'
        }
      }, {
        createdAt: 'desc'
      }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Transform the response
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      type: post.type,
      votes: Array.isArray(post.votes) ? post.votes.length : 0,
      createdAt: post.createdAt.toISOString(),
      author: {
        name: post.author && post.author.firstName 
          ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || 'Anonymous' 
          : 'Anonymous',
        imageUrl: post.author?.imageUrl || null,
      },
      attachments: post.attachments.map(att => ({
        id: att.id,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        fileType: att.fileType,
      })),
    }));

    return NextResponse.json({
      posts: formattedPosts,
      hasMore: totalPosts > page * pageSize,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/forum
export async function POST(request: Request) {
  try {
    console.log('POST /api/forum - Request received');
    
    const { userId } = await auth();
    console.log('User ID:', userId);
    
    if (!userId) {
      console.log('Unauthorized - No user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    
    // Log raw form data for debugging
    console.log('Raw form data entries:', Array.from(data.entries()));
    
    const title = data.get('title');
    const content = data.get('content');
    const type = data.get('type');
    
    console.log('Parsed form data:', {
      title: typeof title === 'string' ? title : 'invalid',
      content: typeof content === 'string' ? content : 'invalid',
      type: typeof type === 'string' ? type : 'invalid'
    });
    
    const files = data.getAll('files') as File[];
    console.log('Number of files:', files.length);

    if (!title || !content || !type) {
      console.log('Validation failed - Missing required fields');
      return NextResponse.json({ error: 'Title, content, and type are required' }, { status: 400 });
    }

    // Validate type is a valid PostType
    if (!type || typeof type !== 'string') {
      console.log('Type validation failed - invalid type:', { type, typeOf: typeof type });
      return NextResponse.json({ error: 'Post type is required' }, { status: 400 });
    }

    const postType = Object.values(PostType).find(pt => pt === type);
    if (!postType) {
      console.log('Type validation failed - not a valid PostType:', { 
        receivedType: type,
        validTypes: Object.values(PostType)
      });
      return NextResponse.json({ 
        error: 'Invalid post type',
        received: type,
        validTypes: Object.values(PostType)
      }, { status: 400 });
    }

    console.log('Creating post with data:', {
      title,
      content,
      type,
      userId
    });

    // Create the post
    const post = await prisma.forumPost.create({
      data: {
        title: title as string,
        content: content as string,
        type: postType, // Use validated PostType
        authorId: userId,
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          }
        },
        votes: true,
      }
    });

    if (!post || !post.id) {
      console.error('Failed to create post - post is null or missing ID');
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    console.log('Post created successfully:', post.id);

    // Format the response
    const formattedPost: FormattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      type: post.type,
      votes: 0,
      createdAt: post.createdAt.toISOString(),
      author: {
        name: post.author && post.author.firstName 
          ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || 'Anonymous' 
          : 'Anonymous',
        imageUrl: post.author?.imageUrl || null,
      },
      attachments: [],
    };

    // Handle file uploads
    if (files && files.length > 0) {
      try {
        for (const file of files) {
          // Upload file to your storage service (e.g., S3, Cloudinary)
          // const fileUrl = await uploadFile(file);
          // For now using a placeholder URL - replace this with actual upload logic
          const tempFileUrl = 'fileUrl';
          
          const attachment = await prisma.attachment.create({
            data: {
              fileName: file.name,
              fileUrl: tempFileUrl,
              fileType: file.type.startsWith('image/') ? 'IMAGE' : 
                       file.type.startsWith('audio/') ? 'AUDIO' : 'OTHER',
              postId: post.id
            }
          });
          
          formattedPost.attachments.push({
            id: attachment.id,
            fileName: attachment.fileName,
            fileUrl: attachment.fileUrl,
            fileType: attachment.fileType
          });
        }
      } catch (fileError) {
        console.error('Error handling file uploads:', fileError);
        return NextResponse.json(
          { 
            error: 'File Upload Error',
            message: 'Failed to process file attachments',
            details: fileError instanceof Error ? fileError.message : 'Unknown error'
          },
          { status: 400 }
        );
      }
    }

    console.log('Sending formatted response:', formattedPost);
    // Ensure we're not sending null as a payload
    if (!formattedPost || typeof formattedPost !== 'object') {
      return NextResponse.json({ 
        error: 'Invalid post data',
        message: 'Failed to create valid post data'
      }, { status: 500 });
    }
    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    
    return NextResponse.json(
      { 
        error: 'Post Creation Failed',
        message: 'Failed to create new post',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
   
  }
}

// DELETE /api/forum/[id]
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.url.split('/').pop();
    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== (await auth()).userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.forumPost.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
