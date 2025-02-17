'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMusic, FaImage, FaBook, FaComments, FaArrowUp, FaTrash } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';

interface Post {
  id: string;
  title: string;
  content: string;
  type: 'GENERAL_DISCUSSION' | 'ART_EXPRESSION' | 'EDUCATIONAL';
  categories: string[];
  attachments: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: 'IMAGE' | 'AUDIO' | 'OTHER';
  }[];
  votes: number;
  createdAt: Date;
  author: {
    name: string;
    imageUrl?: string;
  };
}

const categories = [
  { id: 'general', name: 'General Discussions', icon: <FaComments /> },
  { id: 'art', name: 'Expressions (Art)', icon: <FaMusic /> },
  { id: 'education', name: 'Educational', icon: <FaBook /> },
];

export default function Forum() {
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Load posts on initial render
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/forum');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        // You might want to show an error message to the user here
      }
    };

    fetchPosts();
  }, []);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState<{
    title: string;
    content: string;
    type: string;
    categories: string[];
  }>({
    title: '',
    content: '',
    type: 'GENERAL_DISCUSSION',
    categories: [],
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const [error, setError] = useState<string>('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newPost.title || !newPost.content) {
      setError('Please fill in both title and content');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('content', newPost.content);
      formData.append('type', newPost.type);
      
      // Convert category names to IDs
      const categoryIds = newPost.categories.map(cat => {
        const category = categories.find(c => c.name === cat);
        return category ? category.id : cat;
      });
      formData.append('categories', categoryIds.join(','));
      
      attachments.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/forum', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      const post = await response.json();
      setPosts(prevPosts => [post, ...prevPosts]);
      setIsModalOpen(false);
      setNewPost({ title: '', content: '', type: 'GENERAL_DISCUSSION', categories: [] });
      setAttachments([]);
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error instanceof Error ? error.message : 'Failed to create post');
    }
  };

  const handleVote = async (postId: string) => {
    try {
      const response = await fetch('/api/forum/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      const { voteCount } = await response.json();
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, votes: voteCount } : post
        )
      );
    } catch (error) {
      console.error('Error voting:', error);
      // You might want to show an error message to the user here
    }
  };

  const filterPosts = (post: Post) => {
    if (selectedCategory === 'all') return true;
    return post.categories.includes(selectedCategory);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Forum</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Post
        </button>
      </div>

      <div className="mb-8">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-64 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
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
                  <div className="flex gap-2 mb-2">
                    {post.categories.map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 bg-gray-100 text-sm rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
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

              {post.attachments.length > 0 && (
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
                  <label className="block mb-2">Type</label>
                  <select
                    value={newPost.type}
                    onChange={(e) => setNewPost({ ...newPost, type: e.target.value as 'GENERAL_DISCUSSION' | 'ART_EXPRESSION' | 'EDUCATIONAL' | 'DAILY INSPIRATION' | 'HUMOR' | 'CAREER SUPPORT' })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="GENERAL_DISCUSSION">General Discussion</option>
                    <option value="ART_EXPRESSION">Art Expression</option>
                    <option value="EDUCATIONAL">Educational</option>
                    <option value="DAILY INSPIRATION">Daily Inspiration</option>
                    <option value="HUMOR">Humor</option>
                    <option value="CAREER_SUPPORT">Career Support</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setNewPost(prev => ({
                            ...prev,
                            categories: prev.categories.includes(category.id)
                              ? prev.categories.filter(id => id !== category.id)
                              : [...prev.categories, category.id]
                          }));
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${newPost.categories.includes(category.id)
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                          } hover:bg-blue-50 transition-colors`}
                      >
                        {category.icon}
                        {category.name}
                      </button>
                    ))}
                  </div>
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