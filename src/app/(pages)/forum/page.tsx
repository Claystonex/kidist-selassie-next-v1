'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMusic, FaImage, FaBook, FaComments, FaArrowUp, FaTrash, FaLanguage } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';
import { useUser } from '@clerk/nextjs';
import TranslatableText from '@/app/_components/TranslatableText';
import CommentTranslator from '@/app/_components/CommentTranslator';
import { useTranslation } from '@/app/_contexts/TranslationContext';

interface Post {
  id: string;
  title: string;
  content: string;
  type: 'GENERAL_DISCUSSION' | 'ART_EXPRESSION' | 'EDUCATIONAL' | 'DAILY_INSPIRATION' | 'HUMOR' | 'CAREER_SUPPORT';
  attachments: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: 'IMAGE' | 'AUDIO' | 'OTHER';
  }[];
  votes: number;
  createdAt: string;
  author: {
    name: string;
    imageUrl?: string | null;
    id?: string; // Add author id for ownership check
  };
}

interface NewPost {
  title: string;
  content: string;
  type: string;
}

// Admin emails that are allowed to upload media
const ADMIN_EMAILS = ['selassieyouthtrinity@gmail.com'];

// Function to check if user is an admin
const isAdminUser = (email?: string): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// List of curse words to filter out
const PROFANITY_LIST = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'cunt', 'dick', 'bastard',
  'asshole', 'motherfucker', 'bullshit', 'crap', 'piss', 'whore', 'slut', 'darn', 'heck', 'goddamn', 'hell', 'pussy', 'f*ck', 'sh*t', '*ss', 'b*tch', 'd*ck', 'b*stard', 'a*shole', 'm*therfucker', 'b*llshit', 'c*ap', 'p*ss', 'wh*re', 'sl*t', 'd*rn', 'h*ll', 'p*ssy'
];

// Warning messages to display randomly
const WARNING_MESSAGES = [
  "Watch your mouth!",
  "Do a little better.",
  "Let's keep it respectful.",
  "That language isn't allowed here.",
  "Please choose different words."
];

// Function to check for profanity in text
const containsProfanity = (text: string | undefined): boolean => {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  // Log for debugging
  console.log('Checking text for profanity:', lowerText);
  
  // Check each word in our profanity list
  for (const word of PROFANITY_LIST) {
    try {
      // Escape special regex characters in the word, especially for words with asterisks
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Replace asterisks with a character class that matches any character
      const regexPattern = escapedWord.replace(/\\\*/g, '.');
      const regex = new RegExp('\\b' + regexPattern + '\\b', 'i');
      
      if (regex.test(lowerText)) {
        console.log(`Profanity detected: '${word}' found in text`);
        return true;
      }
    } catch (error) {
      console.error(`Error with profanity regex for word '${word}':`, error);
      // Continue checking other words even if one regex fails
      continue;
    }
  }
  
  console.log('No profanity detected in text');
  return false;
};

export default function Forum() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfanityWarningOpen, setIsProfanityWarningOpen] = useState(false);
  const [profanityWarningMessage, setProfanityWarningMessage] = useState('');
  const [newPost, setNewPost] = useState<NewPost>({ title: '', content: '', type: 'GENERAL_DISCUSSION' });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'votes'>('newest');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // Get user information from Clerk
  const { isLoaded: isUserLoaded, isSignedIn, user: clerkUser } = useUser();
  // Ensure userId is a string or null, not undefined
  const userId = clerkUser?.id || null;
  
  // Check if user is an admin
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress || '';
  const isAdmin = isAdminUser(userEmail);
  
  // Log user ID on load for debugging
  useEffect(() => {
    console.log('Auth state:', { isUserLoaded, isSignedIn });
    console.log('User info:', clerkUser ? { 
      id: clerkUser.id,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName
    } : 'No user data');
    
    if (isUserLoaded && isSignedIn && userId) {
      console.log('Current logged-in user ID:', userId);
      console.log('User ID type:', typeof userId);
    }
  }, [isUserLoaded, isSignedIn, userId, clerkUser]);
  
  // Show profanity warning once when first visiting the forum
  useEffect(() => {
    const hasSeenProfanityWarning = localStorage.getItem('hasSeenProfanityWarning');
    if (!hasSeenProfanityWarning && isUserLoaded && isSignedIn) {
      const randomIndex = Math.floor(Math.random() * WARNING_MESSAGES.length);
      const message = WARNING_MESSAGES[randomIndex] || "Watch your language!";
      setProfanityWarningMessage(message);
      setIsProfanityWarningOpen(true);
    }
  }, [isUserLoaded, isSignedIn]);
  
  const loadMorePosts = async () => {
    if (!hasMore || isLoading) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/forum?page=${page}&sort=${sortBy}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      // Transform the posts to match our interface
      const transformedPosts = data.posts.map((post: any) => {
        // Log post author info for debugging
        console.log(`Post ${post.id} author:`, post.author);
        
        return {
          ...post,
          createdAt: post.createdAt || new Date().toISOString(), // Provide default if null
          author: {
            name: post.author?.name || 'Anonymous',
            imageUrl: post.author?.imageUrl || null,
            id: post.author?.id || null // Include author ID for ownership checks
          },
          attachments: Array.isArray(post.attachments) ? post.attachments : []
        };
      });
      
      // Log the transformed posts for debugging
      console.log('Transformed posts with author IDs:', transformedPosts.map((p: Post) => ({ id: p.id, authorId: p.author.id })));
      console.log('Current user ID for comparison:', userId);
      
      setPosts(prev => [...prev, ...transformedPosts]);
      setHasMore(data.hasMore);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      setPosts([]);
      setPage(1);
      setHasMore(true);
      await loadMorePosts();
      
      // Log the current user ID for debugging
      console.log('Current user ID:', userId);
    };
    initialLoad();
  }, [sortBy, userId]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000) {
        loadMorePosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, hasMore, isLoading]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    
    // Validate inputs
    setError('');
    if (!newPost.title?.trim() || !newPost.content?.trim()) {
      console.log('Form validation failed - missing title or content');
      setError('Please fill in both title and content');
      return;
    }

    // Check if user is signed in
    if (!isSignedIn) {
      console.log('Form submission rejected - user not signed in');
      setError('You must be signed in to create a post');
      return;
    }
    
    // Check for profanity in title and content
    console.log('Checking for profanity before submission');
    console.log('Title:', newPost.title);
    console.log('Content:', newPost.content);
    
    const titleHasProfanity = containsProfanity(newPost.title);
    const contentHasProfanity = containsProfanity(newPost.content);
    
    if (titleHasProfanity || contentHasProfanity) {
      console.log('Form submission rejected - profanity detected');
      console.log('Title has profanity:', titleHasProfanity);
      console.log('Content has profanity:', contentHasProfanity);
      
      const randomIndex = Math.floor(Math.random() * WARNING_MESSAGES.length);
      const message = WARNING_MESSAGES[randomIndex] || "Watch your language!";
      setProfanityWarningMessage(message);
      setIsProfanityWarningOpen(true);
      setError('Your post contains language that is not allowed in this forum.');
      setFormSubmitting(false);
      setIsLoading(false);
      return;
    } else {
      console.log('No profanity detected, proceeding with submission');
    }

    try {
      // Set loading state
      console.log('Setting loading state and preparing submission');
      setIsLoading(true);
      setFormSubmitting(true);
      
      // Prepare form data
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('content', newPost.content);
      formData.append('type', newPost.type || 'GENERAL_DISCUSSION');
      
      // Add attachments if any
      if (attachments.length > 0) {
        console.log(`Adding ${attachments.length} attachment(s) to form data`);
        attachments.forEach((file, index) => {
          console.log(`Attachment ${index+1}:`, file.name, file.type, file.size);
          formData.append('files', file);
        });
      }
      
      // Log form data for debugging
      console.log('Form data prepared with the following entries:');
      for (const pair of formData.entries()) {
        if (pair[0] === 'files') {
          console.log('- files:', (pair[1] as File).name);
        } else {
          console.log(`- ${pair[0]}:`, pair[1]);
        }
      }
      
      // Send the request
      console.log('Sending POST request to /api/forum');
      const response = await fetch('/api/forum', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response received:', response.status, response.statusText);
      
      // Get the response text first to safely handle empty responses
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Raw response text:', responseText);
      
      // Parse the JSON response only if there's content
      let data: Record<string, any> = {};
      if (responseText && responseText.trim() !== '') {
        try {
          data = JSON.parse(responseText) as Record<string, any>;
          console.log('Parsed response data:', data);
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          throw new Error('Invalid response format from server');
        }
      } else {
        console.warn('Empty response received from server');
        throw new Error('The server returned an empty response');
      }
      
      // Handle error response
      if (!response.ok) {
        const errorMessage = data && typeof data === 'object' && 'error' in data 
          ? String(data.error)
          : 'Failed to create post';
        console.error('Request failed with status', response.status, errorMessage);
        throw new Error(errorMessage);
      }
      
      // Success! Reset form and close modal
      console.log('Post created successfully, resetting form');
      setIsModalOpen(false);
      setNewPost({ title: '', content: '', type: 'GENERAL_DISCUSSION' });
      setAttachments([]);
      
      // Show success message
      setSuccess('Your post has been created successfully!');
      setTimeout(() => setSuccess(''), 5000);
      
      // Update posts list with the new post if we have valid data
      if (data && typeof data === 'object' && 'id' in data) {
        console.log('Adding new post to the posts list:', data.id);
        
        // Convert the API response to match our Post type
        const newPost: Post = {
          id: String(data.id),
          title: String(data.title || ''),
          content: String(data.content || ''),
          type: (data.type || 'GENERAL_DISCUSSION') as Post['type'],
          attachments: Array.isArray(data.attachments) 
            ? data.attachments.map((att: any) => ({
                id: String(att.id || ''),
                fileName: String(att.fileName || ''),
                fileUrl: String(att.fileUrl || ''),
                fileType: (att.fileType || 'OTHER') as 'IMAGE' | 'AUDIO' | 'OTHER',
              }))
            : [],
          votes: Number(data.voteCount || 0),
          createdAt: String(data.createdAt || new Date().toISOString()),
          author: {
            name: data.author?.name || 'Anonymous',
            imageUrl: data.author?.imageUrl || null,
            id: data.author?.id || userId, // Include author ID and default to current user
          },
        };
        
        setPosts(prevPosts => [newPost, ...prevPosts]);
      } else {
        console.warn('Could not add post to list - invalid data format');
      }
      
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      console.log('Resetting loading state');
      setIsLoading(false);
      setFormSubmitting(false);
    }
  };

  const handleVote = async (postId: string) => {
    try {
      setIsLoading(true);
      console.log('Voting for post:', postId);
      
      const response = await fetch('/api/forum/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      const data = await response.json();
      console.log('Vote response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote');
      }

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, votes: data.voteCount } : post
        )
      );
    } catch (error) {
      console.error('Error voting:', error);
      setError(error instanceof Error ? error.message : 'Failed to vote');
      setTimeout(() => setError(''), 5000); // Clear error after 5 seconds
    } finally {
      setIsLoading(false);
    }
  };

  // Handle post deletion
  const handleDelete = async (postId: string) => {
    try {
      setIsLoading(true);
      console.log('Deleting post:', postId);
      console.log('Current user ID for delete operation:', userId);
      
      // Confirm with the user before deleting
      if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        setIsLoading(false);
        return;
      }
      
      // Log full delete request details
      console.log('Sending DELETE request to:', `/api/forum/${postId}`);
      
      const response = await fetch(`/api/forum/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Get the response text first to safely handle empty responses
      const responseText = await response.text();
      console.log('Delete response status:', response.status);
      console.log('Raw delete response text:', responseText);
      
      // Parse the JSON response only if there's content
      let data: Record<string, any> = {};
      if (responseText && responseText.trim() !== '') {
        try {
          data = JSON.parse(responseText);
          console.log('Parsed delete response data:', data);
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          throw new Error('Invalid response format from server');
        }
      }

      if (!response.ok) {
        console.error('Delete request failed:', response.status, data);
        throw new Error(data.error || 'Failed to delete post');
      }

      // Remove the deleted post from the state
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      // Show success message
      setSuccess('Post deleted successfully!');
      setTimeout(() => setSuccess(''), 5000); // Clear success after 5 seconds
    } catch (error) {
      console.error('Error deleting post:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete post');
      setTimeout(() => setError(''), 5000); // Clear error after 5 seconds
    } finally {
      setIsLoading(false);
    }
  };

  const filterPosts = (post: Post) => {
    if (selectedType === 'all') return true;
    return post.type === selectedType;
  };

  // Show loading state when checking authentication
  if (!isUserLoaded) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold"><TranslatableText>Loading...</TranslatableText></h1>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold"><TranslatableText>You must be logged in to view the forum.</TranslatableText></h1>
        <button 
          onClick={() => window.location.href = '/sign-in'} 
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          <TranslatableText>Sign In</TranslatableText>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Comment Translator Section */}
      <div id="comment-translator" className="mb-8">
        <CommentTranslator />
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">
            <TranslatableText>Forum</TranslatableText>
          </h1>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'votes')}
            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest"><TranslatableText>Newest First</TranslatableText></option>
            <option value="votes"><TranslatableText>Most Voted</TranslatableText></option>
          </select>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <TranslatableText>Create Post</TranslatableText>
        </button>
      </div>

      <div className="mb-8">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full md:w-64 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all"><TranslatableText>All Categories</TranslatableText></option>
          <option value="GENERAL_DISCUSSION"><TranslatableText>General Discussion</TranslatableText></option>
          <option value="ART_EXPRESSION"><TranslatableText>Art & Expression</TranslatableText></option>
          <option value="EDUCATIONAL"><TranslatableText>Educational</TranslatableText></option>
          <option value="DAILY_INSPIRATION"><TranslatableText>Daily Inspiration</TranslatableText></option>
          <option value="HUMOR"><TranslatableText>Humor</TranslatableText></option>
          <option value="CAREER_SUPPORT"><TranslatableText>Career Support</TranslatableText></option>
        </select>
      </div>

      <div className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 text-red-600 rounded-lg"
          >
            <TranslatableText>{error}</TranslatableText>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-50 text-green-600 rounded-lg"
          >
            <TranslatableText>{success}</TranslatableText>
          </motion.div>
        )}
        
        <AnimatePresence>
          {posts.filter(filterPosts).map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 bg-white rounded-lg shadow-md border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2"><TranslatableText>{post.title}</TranslatableText></h2>
                    <span className="px-2 py-1 bg-gray-100 text-sm rounded-full">
                    <TranslatableText>{post.type.replace('_', ' ')}</TranslatableText>
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Temporary solution: Show delete button for all posts if user is logged in */}
                  {userId && (
                    <button
                      onClick={() => {
                        // Log detailed debug info when delete is clicked
                        console.log('Delete attempt for post:', post.id);
                        console.log('Post author ID:', post.author.id);
                        console.log('Current user ID:', userId);
                        console.log('Type of author ID:', typeof post.author.id);
                        console.log('Type of user ID:', typeof userId);
                        console.log('Direct comparison:', post.author.id === userId);
                        console.log('String comparison:', String(post.author.id) === String(userId));
                        
                        // Proceed with delete
                        handleDelete(post.id);
                      }}
                      className="flex items-center gap-1 text-red-500 hover:text-red-600"
                      title="Delete post"
                    >
                      <FaTrash />
                    </button>
                  )}
                  <button
                    onClick={() => handleVote(post.id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
                  >
                    <FaArrowUp />
                    <span>{post.votes}</span>
                  </button>
                </div>
              </div>

              <TranslatableText as="p" className="mb-4">{post.content}</TranslatableText>
              
              {/* Translate button */}
              <button
                onClick={() => {
                  // Store the current post ID in a temporary state to indicate it's being translated
                  // You could implement this with a state variable like:
                  // const [translatingPostId, setTranslatingPostId] = useState<string | null>(null);
                  // setTranslatingPostId(post.id);
                  // Then render a translation component below when translatingPostId === post.id
                  
                  // For simplicity, we'll just scroll to the translator and pre-fill it
                  const translatorElement = document.getElementById('comment-translator');
                  if (translatorElement) {
                    translatorElement.scrollIntoView({ behavior: 'smooth' });
                    
                    // If you want to automatically fill the translator with this post content:
                    // You would need to add a ref or function to the CommentTranslator component 
                    // to allow setting its input text from outside
                  }
                }}
                className="text-sm flex items-center gap-1 text-[#086c47] hover:text-[#064e33] mb-4"
              >
                <FaLanguage className="text-lg" />
                <span><TranslatableText>Translate this post</TranslatableText></span>
              </button>

              {post.attachments && post.attachments.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {post.attachments.map((attachment) => (
                    <div key={attachment.id}>
                      {attachment.fileType === 'IMAGE' ? (
                        <img
                          src={attachment.fileUrl}
                          alt={attachment.fileName}
                          className="rounded-lg w-full h-48 object-cover"
                        />
                      ) : attachment.fileType === 'AUDIO' ? (
                        <audio
                          controls
                          className="w-full"
                          src={attachment.fileUrl}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  {post.author.imageUrl && (
                    <img
                      src={post.author.imageUrl}
                      alt={post.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span><TranslatableText>{post.author.name}</TranslatableText></span>
                </div>
                <span><TranslatableText>{new Date(post.createdAt).toLocaleDateString()}</TranslatableText></span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!isLoading && !hasMore && posts.length > 0 && (
          <div className="text-center py-4 text-gray-500">
            <TranslatableText>No more posts to load</TranslatableText>
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <TranslatableText>No posts found. Be the first to create one!</TranslatableText>
          </div>
        )}
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <Dialog.Panel className="fixed inset-0 bg-black/30" />

            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
              <h3 className="text-lg font-medium mb-4"><TranslatableText>Create New Post</TranslatableText></h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2 mb-4">
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                      <strong className="font-bold"><TranslatableText>Error: </TranslatableText></strong>
                      <span className="block sm:inline"><TranslatableText>{error}</TranslatableText></span>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium">
                    <TranslatableText>Title</TranslatableText>
                  </label>
                  <input
                    type="text"
                    id="title"
                    placeholder="Title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium">
                    <TranslatableText>Content</TranslatableText>
                  </label>
                  <textarea
                    id="content"
                    placeholder="Content"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full p-2 border rounded-lg h-32"
                  />
                </div>

                <div>
                  <label className="block mb-2"><TranslatableText>Category</TranslatableText></label>
                  <select
                    value={newPost.type}
                    onChange={(e) => setNewPost({ ...newPost, type: e.target.value as Post['type'] })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="GENERAL_DISCUSSION"><TranslatableText>General Discussion</TranslatableText></option>
                    <option value="ART_EXPRESSION"><TranslatableText>Art & Expression</TranslatableText></option>
                    <option value="EDUCATIONAL"><TranslatableText>Educational</TranslatableText></option>
                    <option value="DAILY_INSPIRATION"><TranslatableText>Daily Inspiration</TranslatableText></option>
                    <option value="HUMOR"><TranslatableText>Humor</TranslatableText></option>
                    <option value="CAREER_SUPPORT"><TranslatableText>Career Support</TranslatableText></option>
                  </select>
                </div>

                {isAdmin && (
                  <div>
                    <label className="block mb-2"><TranslatableText>Attachments</TranslatableText> <span className="text-xs text-blue-600 ml-1">(Admin Only)</span></label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*,audio/*"
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      <TranslatableText>Upload Files</TranslatableText>
                    </button>
                    {attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span>{file.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newAttachments = [...attachments];
                                newAttachments.splice(index, 1);
                                setAttachments(newAttachments);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    <TranslatableText>Cancel</TranslatableText>
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className={`px-4 py-2 ${formSubmitting ? 'bg-blue-300' : 'bg-blue-600'} text-white rounded-lg hover:bg-blue-700 transition-colors`}
                  >
                    {formSubmitting ? <TranslatableText>Submitting...</TranslatableText> : <TranslatableText>Create Post</TranslatableText>}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>

      {/* Profanity Warning Modal */}
      <Dialog
        open={isProfanityWarningOpen}
        onClose={() => {
          setIsProfanityWarningOpen(false);
          localStorage.setItem('hasSeenProfanityWarning', 'true');
        }}
      >
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <Dialog.Panel className="fixed inset-0 bg-black/30" />

            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
              <div className="mb-4 text-center">
                <h3 className="text-xl font-bold text-red-600 mb-4"><TranslatableText>Forum Rules</TranslatableText></h3>
                <p className="mb-4"><TranslatableText>{profanityWarningMessage}</TranslatableText></p>
                <p className="mb-4"><TranslatableText>This forum does not allow profanity or offensive language. Please keep your posts respectful and appropriate.</TranslatableText></p>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfanityWarningOpen(false);
                    localStorage.setItem('hasSeenProfanityWarning', 'true');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <TranslatableText>I Understand</TranslatableText>
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}