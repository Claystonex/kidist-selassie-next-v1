'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMusic, FaImage, FaBook, FaComments, FaArrowUp, FaTrash } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';
import { useUser } from '@clerk/nextjs';

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
  };
}

interface NewPost {
  title: string;
  content: string;
  type: string;
}

export default function Forum() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const userId = clerkUser?.id;
  
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
      const transformedPosts = data.posts.map((post: any) => ({
        ...post,
        createdAt: post.createdAt || new Date().toISOString(), // Provide default if null
        author: {
          name: post.author?.name || 'Anonymous',
          imageUrl: post.author?.imageUrl || null
        },
        attachments: Array.isArray(post.attachments) ? post.attachments : []
      }));
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
    };
    initialLoad();
  }, [sortBy]);

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

  const filterPosts = (post: Post) => {
    if (selectedType === 'all') return true;
    return post.type === selectedType;
  };

  // Show loading state when checking authentication
  if (!isUserLoaded) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">You must be logged in to view the forum.</h1>
        <button 
          onClick={() => window.location.href = '/sign-in'} 
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Forum</h1>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'votes')}
            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="votes">Most Voted</option>
          </select>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Post
        </button>
      </div>

      <div className="mb-8">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full md:w-64 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="GENERAL_DISCUSSION">General Discussion</option>
          <option value="ART_EXPRESSION">Art & Expression</option>
          <option value="EDUCATIONAL">Educational</option>
          <option value="DAILY_INSPIRATION">Daily Inspiration</option>
          <option value="HUMOR">Humor</option>
          <option value="CAREER_SUPPORT">Career Support</option>
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
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-50 text-green-600 rounded-lg"
          >
            {success}
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
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                    <span className="px-2 py-1 bg-gray-100 text-sm rounded-full">
                    {post.type.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => handleVote(post.id)}
                  className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
                >
                  <FaArrowUp />
                  <span>{post.votes}</span>
                </button>
              </div>

              <p className="mb-4">{post.content}</p>

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
                  <span>{post.author.name}</span>
                </div>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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
            No more posts to load
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No posts found. Be the first to create one!
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
              <h3 className="text-lg font-medium mb-4">Create New Post</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2 mb-4">
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                      <strong className="font-bold">Error: </strong>
                      <span className="block sm:inline">{error}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium">
                    Title
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
                    Content
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
                  <label className="block mb-2">Category</label>
                  <select
                    value={newPost.type}
                    onChange={(e) => setNewPost({ ...newPost, type: e.target.value as Post['type'] })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="GENERAL_DISCUSSION">General Discussion</option>
                    <option value="ART_EXPRESSION">Art & Expression</option>
                    <option value="EDUCATIONAL">Educational</option>
                    <option value="DAILY_INSPIRATION">Daily Inspiration</option>
                    <option value="HUMOR">Humor</option>
                    <option value="CAREER_SUPPORT">Career Support</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Attachments</label>
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
                    Upload Files
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

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className={`px-4 py-2 ${formSubmitting ? 'bg-blue-300' : 'bg-blue-600'} text-white rounded-lg hover:bg-blue-700 transition-colors`}
                  >
                    {formSubmitting ? 'Submitting...' : 'Create Post'}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}