import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// GET /api/forum
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const posts = await prisma.forumPost.findMany({
      where: category ? {
        categories: {
          some: {
            name: category
          }
        }
      } : undefined,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          }
        },
        categories: true,
        attachments: true,
        votes: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/forum
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    const title = data.get('title') as string;
    const content = data.get('content') as string;
    const type = data.get('type') as string;
    const categoryIds = (data.get('categories') as string).split(',').filter(Boolean);
    const files = data.getAll('files') as File[];

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Validate categories exist
    const existingCategories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds
        }
      }
    });

    if (existingCategories.length !== categoryIds.length) {
      return NextResponse.json({ error: 'One or more categories are invalid' }, { status: 400 });
    }

    // Create post
    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        type: type as any,
        authorId: userId,
        categories: {
          connect: categoryIds.map(id => ({ id }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          }
        },
        categories: true,
        attachments: true,
        votes: true,
      }
    });

    // Handle file uploads (you'll need to implement file storage logic)
    for (const file of files) {
      // Upload file to your storage service (e.g., S3, Cloudinary)
      // const fileUrl = await uploadFile(file);
      
      await prisma.attachment.create({
        data: {
          fileName: file.name,
          fileUrl: 'fileUrl', // Replace with actual uploaded file URL
          fileType: file.type.startsWith('image/') ? 'IMAGE' : 
                   file.type.startsWith('audio/') ? 'AUDIO' : 'OTHER',
          postId: post.id
        }
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
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
