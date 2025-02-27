'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMusic, FaImage, FaBook, FaComments, FaArrowUp, FaTrash } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';

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

export default function Forum() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'votes'>('newest');
  
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
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState<{
    title: string;
    content: string;
    type: string;
  }>({
    title: '',
    content: '',
    type: 'GENERAL_DISCUSSION',
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newPost.title || !newPost.content) {
      setError('Please fill in both title and content');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Form submission started');
      console.log('Current post data:', newPost);
      
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('content', newPost.content);
      formData.append('type', newPost.type);
      
      attachments.forEach(file => {
        formData.append('files', file);
      });
      
      console.log('Making API request...');
      const response = await fetch('/api/forum', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response status:', response.status);
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('Response data:', responseData);
      } catch (e) {
        console.error('JSON parse error:', e);
        responseData = { error: 'Invalid response format' };
      }
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create post');
      }
      
      // Reset form and close modal first
      setIsModalOpen(false);
      setNewPost({ title: '', content: '', type: 'GENERAL_DISCUSSION' });
      setAttachments([])
      
      // Show success message
      setSuccess('Your post has been created successfully!');
      setTimeout(() => setSuccess(''), 5000); // Clear success message after 5 seconds
      
      // Add the new post to the beginning of the list
      setPosts(prevPosts => [responseData, ...prevPosts]);
      
      console.log('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setIsLoading(false);
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
                <input
                  type="text"
                  placeholder="Title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />

                <textarea
                  placeholder="Content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full p-2 border rounded-lg h-32"
                />

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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Post
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