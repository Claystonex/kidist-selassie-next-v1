import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { PostType, FileType } from '@prisma/client';
import { auth, currentUser } from '@clerk/nextjs/server';

// Valid post types for validation
const validPostTypes = Object.values(PostType);

// Admin emails that are allowed to upload media
const ADMIN_EMAILS = ['selassieyouthtrinity@gmail.com'];

// Function to check if user is an admin
const isAdminUser = (email?: string): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// List of profanity words to filter out
const PROFANITY_LIST = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'cunt', 'dick', 'bastard',
  'asshole', 'motherfucker', 'bullshit', 'crap', 'piss', 'whore', 'slut', 'darn', 'heck', 'goddamn', 'hell', 'pussy', 'f*ck', 'sh*t', '*ss', 'b*tch', 'd*ck', 'b*stard', 'a*shole', 'm*therfucker', 'b*llshit', 'c*ap', 'p*ss', 'wh*re', 'sl*t', 'd*rn', 'h*ll', 'p*ssy'
];

// Function to check for profanity in text
function containsProfanity(text: string | undefined): boolean {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  console.log('API checking text for profanity');
  
  for (const word of PROFANITY_LIST) {
    try {
      // Escape special regex characters in the word, especially for words with asterisks
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Replace asterisks with a character class that matches any character
      const regexPattern = escapedWord.replace(/\\\*/g, '.');
      const regex = new RegExp('\\b' + regexPattern + '\\b', 'i');
      
      if (regex.test(lowerText)) {
        console.log(`API profanity filter: profanity found in text`);
        return true;
      }
    } catch (error) {
      console.error(`Error with profanity regex for word '${word}':`, error);
      // Continue checking other words even if one regex fails
      continue;
    }
  }
  
  return false;
}

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

// Helper function to create a JSON response
function createJsonResponse(data: any, status = 200) {
  // Ensure data is never null or undefined
  const safeData = data !== null && data !== undefined ? data : { error: "Empty response data" };
  
  try {
    // Additional safety check to ensure we never send null to NextResponse.json
    if (safeData === null || safeData === undefined) {
      console.error("Attempting to send null/undefined data in response");
      return NextResponse.json({ error: "Server error: Invalid response data" }, { status: 500 });
    }
    
    // Log the response we're sending for debugging
    console.log(`Sending ${status} response:`, 
      typeof safeData === 'object' 
        ? JSON.stringify(safeData).substring(0, 200) + (JSON.stringify(safeData).length > 200 ? '...' : '')
        : safeData
    );
    
    // If safeData is not an object, wrap it in an object
    const finalData = typeof safeData === 'object' ? safeData : { data: safeData };
    
    return NextResponse.json(finalData, { status });
  } catch (error) {
    // If serialization fails, send a safe fallback response
    console.error('Error in response creation:', error);
    return NextResponse.json({ 
      error: "Failed to create response",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
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
    const formattedPosts = posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      type: post.type,
      votes: Array.isArray(post.votes) ? post.votes.length : 0,
      createdAt: post.createdAt.toISOString(),
      author: {
        name: post.author?.firstName || post.author?.lastName 
          ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() 
          : 'Anonymous',
        imageUrl: post.author?.imageUrl || null,
        id: post.author?.id || null, // Add the author ID for ownership checks
      },
      attachments: post.attachments.map((att: any) => {
        const formattedAtt: FormattedAttachment = {
          id: att.id,
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileType: att.fileType,
        };
        return formattedAtt;
      }),
    }));

    return createJsonResponse({
      posts: formattedPosts,
      hasMore: totalPosts > page * pageSize,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return createJsonResponse({ error: 'Failed to fetch posts' }, 500);
  }
}

// POST /api/forum
export async function POST(request: Request) {
  console.log('POST /api/forum - Request received');
  
  try {
    // Get the user ID from authentication
    const authResult = await auth();
    const userId = authResult?.userId;
    console.log('Authentication check:', userId ? 'User authenticated' : 'No user ID');
    
    // For debugging - log the request headers
    const headerObj: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headerObj[key] = value;
    });
    console.log('Request headers:', JSON.stringify(headerObj));
    
    // Proceed even if userId is null for debugging purposes
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      console.log('WARNING: No user ID found, using fallback ID for debugging');
      effectiveUserId = 'anonymous-user-' + Date.now();
    }
    
    // Check if user exists in the database, create if not
    let user = await prisma.user.findUnique({ where: { id: effectiveUserId } });
    
    if (!user) {
      console.log('User not found in database, creating new user record');
      try {
        // Try to get user info from Clerk
        console.log('Fetching user data from Clerk for user ID:', effectiveUserId);
        let firstName = "";
        let lastName = "";
        let emailAddress = `${effectiveUserId}@example.com`;
        let imageUrl = null;
        
        try {
          const user = await currentUser();
          if (user) {
            firstName = user.firstName || "";
            lastName = user.lastName || "";
            emailAddress = user.emailAddresses[0]?.emailAddress || emailAddress;
            imageUrl = user.imageUrl || null;
            console.log('Successfully fetched user data from Clerk');
          } else {
            console.log('User data not available from Clerk, using default values');
          }
        } catch (clerkError) {
          console.error('Error fetching user from Clerk, using default values:', clerkError);
          // Continue with default values
        }
        
        // Create a new user record
        user = await prisma.user.create({
          data: {
            id: effectiveUserId,
            firstName,
            lastName,
            emailAddress,
            imageUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log('User created successfully with ID:', userId);
      } catch (userCreateError) {
        console.error('Error creating user:', userCreateError);
        return createJsonResponse({ 
          error: 'Failed to create user record',
          message: 'Please try again or contact support'
        }, 500);
      }
    }
    
    // Parse the form data
    console.log('Parsing form data');
    const formData = await request.formData();
    
    // Extract the form fields
    const title = formData.get('title')?.toString().trim();
    const content = formData.get('content')?.toString().trim();
    const type = formData.get('type')?.toString() || 'GENERAL_DISCUSSION';
    
    console.log('Form data parsed:', { 
      title: title ? `${title.substring(0, 20)}${title.length > 20 ? '...' : ''}` : null,
      contentLength: content ? content.length : 0,
      type 
    });
    
    // Validate required fields
    if (!title || !content) {
      console.log('Validation failed - missing required fields');
      return createJsonResponse({ 
        error: 'Title and content are required',
        missing: { title: !title, content: !content }
      }, 400);
    }
    
    // Check for profanity in title and content
    if (containsProfanity(title) || containsProfanity(content)) {
      console.log('POST request rejected due to profanity');
      return createJsonResponse({ 
        error: 'Your post contains language that is not allowed in this forum'
      }, 400);
    }
    
    // Validate post type
    if (!validPostTypes.includes(type as PostType)) {
      console.log('Invalid post type:', type);
      return createJsonResponse({ 
        error: 'Invalid post type',
        validTypes: validPostTypes 
      }, 400);
    }
    
    // Process file uploads if any - but only for admin users
    const files = formData.getAll('files');
    const userEmail = (await currentUser())?.emailAddresses?.[0]?.emailAddress || '';
    const isAdmin = isAdminUser(userEmail);
    
    console.log(`Processing ${files.length} file uploads. User email: ${userEmail}, Is admin: ${isAdmin}`);
    
    // Reject file uploads from non-admin users
    if (files.length > 0 && !isAdmin) {
      console.log('File upload rejected - user is not an admin');
      return createJsonResponse({
        error: 'You do not have permission to upload files. Only administrators can upload media.'
      }, 403);
    }
    
    const attachments: { url: string; fileType: FileType }[] = [];
    
    // If files were uploaded, process them
    if (files && files.length > 0) {
      for (const file of files) {
        if (file instanceof File) {
          console.log(`Processing file: ${file.name} (${file.type}, ${file.size} bytes)`);
          
          // Determine file type based on MIME type
          let fileType: FileType = FileType.OTHER;
          if (file.type.startsWith('image/')) {
            fileType = FileType.IMAGE;
          } else if (file.type.startsWith('audio/')) {
            fileType = FileType.AUDIO;
          }
              
          console.log(`Detected file type: ${fileType}`);
          attachments.push({
            url: `https://example.com/uploads/${file.name}`,
            fileType,
          });
        } else {
          console.warn('Non-file object in files field:', file);
        }
      }
    }
    
    console.log('Creating post in database with data:', {
      title: title?.substring(0, 20) + '...',
      contentPreview: content?.substring(0, 20) + '...',
      type,
      authorId: userId
    });
    
    // Create the post in the database - with more careful approach to includes
    let post: any = null;
    try {
      // First try creating without includes
      post = await prisma.forumPost.create({
        data: {
          title,
          content,
          type: type as PostType,
          authorId: effectiveUserId,
        }
      });
      
      console.log('Base post created successfully with ID:', post.id);
      
      // Now fetch the post with includes separately to isolate any relation issues
      const postWithRelations = await prisma.forumPost.findUnique({
        where: { id: post.id },
        include: {
          author: true,
          votes: true,
        }
      });
      
      // Only update post if the query succeeds
      if (postWithRelations) {
        post = postWithRelations;
        console.log('Post fetched with relations');
      }
    } catch (dbError) {
      console.error('Database error details:', dbError);
      throw new Error(`Database creation failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }
    
    // Handle file uploads - make sure post exists before creating attachments
    if (post && attachments.length > 0) {
      console.log(`Creating ${attachments.length} attachment records in database`);
      try {
        const attachmentPromises = attachments.map((attachment: { url: string; fileType: FileType }) => {
          return prisma.attachment.create({
            data: {
              fileName: attachment.url.split('/').pop() as string,
              fileUrl: attachment.url,
              fileType: attachment.fileType,
              postId: post.id
            }
          });
        });

        await Promise.all(attachmentPromises);
        console.log('All attachments created successfully');
      } catch (attachmentError) {
        console.error('Error creating attachments:', attachmentError);
        // Continue with the post creation even if attachments fail
      }
    }
    
    // Format the post for the response with null checks
    const formattedPost = {
      id: post?.id || 'unknown',
      title: post?.title || '',
      content: post?.content || '',
      type: post?.type || 'GENERAL_DISCUSSION',
      createdAt: post?.createdAt ? post.createdAt.toISOString() : new Date().toISOString(),
      author: {
        name: post?.author?.firstName || post?.author?.lastName 
          ? `${post?.author?.firstName || ''} ${post?.author?.lastName || ''}`.trim() 
          : 'Anonymous',
        imageUrl: post?.author?.imageUrl || null,
      },
      voteCount: post?.votes?.length || 0,
      attachments: attachments.map((attachment: { url: string; fileType: FileType }, index: number) => ({
        id: `temp-${index}-${Date.now()}`, // Generate a temporary ID for new attachments
        fileName: attachment.url.split('/').pop() || 'file',
        fileUrl: attachment.url,
        fileType: attachment.fileType,
      })),
    };
    
    console.log('Sending successful response');
    return createJsonResponse(formattedPost);
    
  } catch (error) {
    console.error('Error creating post:', error);
    
    // Enhanced error handling for foreign key constraint errors
    if (
      (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') || 
      (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('foreign key constraint'))
    ) {
      return createJsonResponse({ 
        error: 'Database relationship error',
        message: 'Failed to create post due to a foreign key constraint violation. This might be due to an invalid user ID or post type.',
        details: error && typeof error === 'object' && 'message' in error ? error.message : 'Unknown error'
      }, 400);
    }
    
    return createJsonResponse({ 
      error: 'Failed to create post',
      message: error && typeof error === 'object' && 'message' in error ? error.message : 'Unknown error'
    }, 500);
  }
}

// DELETE /api/forum/[id]
export async function DELETE(request: Request) {
  try {
    // Check authentication
    const authResult = await auth();
    const userId = authResult?.userId;
    
    if (!userId) {
      return createJsonResponse({ error: 'You must be signed in to delete a post' }, 401);
    }

    // Get post ID from URL
    const urlParts = request.url.split('/');
    const id = urlParts[urlParts.length - 1];
    
    if (!id) {
      return createJsonResponse({ error: 'Post ID is required' }, 400);
    }

    // Check if post exists and user is the author
    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!post) {
      return createJsonResponse({ error: 'Post not found' }, 404);
    }

    if (post.authorId !== userId) {
      return createJsonResponse({ error: 'You can only delete your own posts' }, 403);
    }

    // Delete the post
    await prisma.forumPost.delete({
      where: { id },
    });

    return createJsonResponse({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return createJsonResponse({
      error: 'Failed to delete post',
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
}
