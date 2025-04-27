'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMusic, FaImage, FaBook, FaComments, FaArrowUp, FaTrash, FaLanguage } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';
import { useUser } from '@clerk/nextjs';
import TranslatableText from '@/app/_components/TranslatableText';
import CommentTranslator from '@/app/_components/CommentTranslator';
import { useTranslation } from '@/app/_contexts/TranslationContext';
import VerseOfTheDay from '@/app/_components/VerseOfTheDay';
import StaticVerse from '@/app/_components/StaticVerse';
import forumStyles from '@/styles/Forum.module.css';

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
  isAdmin: boolean; // Added for official posts
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
  const [showOfficialOnly, setShowOfficialOnly] = useState<boolean>(false);
  
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
      // Process posts from API response
      const normalizedPosts = data.posts.map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        type: post.type,
        attachments: Array.isArray(post.attachments) ? post.attachments : [],
        votes: post.votes || 0,
        createdAt: post.createdAt || new Date().toISOString(),
        isAdmin: post.isAdmin || false,
        author: {
          name: post.author?.name || 'Anonymous',
          imageUrl: post.author?.imageUrl || null,
          id: post.author?.id || null
        },
      }));
      
      setPosts(prev => [...prev, ...normalizedPosts]);
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
      return;
    } else {
      console.log('No profanity detected, proceeding with submission');
    }

    try {
      // Set loading state
      setFormSubmitting(true);
      setError('');
      
      // Prepare form data for file uploads
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('content', newPost.content);
      formData.append('type', newPost.type);
      formData.append('isAdmin', 'false'); // User posts are never admin posts
      
      // Add user ID if available
      if (userId) {
        formData.append('userId', userId);
      }
      
      // Add files if any
      attachments.forEach(file => {
        formData.append('files', file);
      });
      
      // POST the form data to the API
      const response = await fetch('/api/forum', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }
      
      // Success
      console.log('Post created successfully');
      setSuccess('Post created successfully!');
      
      // Reset the form and attachments
      setNewPost({ title: '', content: '', type: 'GENERAL_DISCUSSION' });
      setAttachments([]);
      setIsModalOpen(false);
      
      // Reload posts
      setPosts([]);
      setPage(1);
      loadMorePosts();
      
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left sidebar with static verse - John 12:9-17 */}
        <div className="hidden md:block md:col-span-3">
          <StaticVerse />
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold"><TranslatableText>Forum</TranslatableText></h1>
            
            {isSignedIn ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-[#086c47] hover:bg-[#064d32] text-white rounded-lg transition-colors duration-200"
              >
                <TranslatableText>Create Post</TranslatableText>
              </button>
            ) : (
              <button
                onClick={() => setError('You must be signed in to create a post')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg cursor-not-allowed"
              >
                <TranslatableText>Sign In to Post</TranslatableText>
              </button>
            )}
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline"><TranslatableText>{error}</TranslatableText></span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline"><TranslatableText>{success}</TranslatableText></span>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <CommentTranslator id="comment-translator" className="mb-6" />
          </div>
          
          <div className="mt-8">
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 mb-4 bg-white rounded-lg shadow-md ${
                    post.isAdmin ? forumStyles.adminPost : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="mr-3">
                        <img 
                          src={post.isAdmin ? '/assets/lion-of-judah-2.jpg' : (post.author?.imageUrl || '/assets/default-avatar.png')} 
                          alt={post.isAdmin ? 'Official' : (post.author?.name || 'User')}
                          className={`w-10 h-10 rounded-full border-2 ${post.isAdmin ? 'border-green-600' : 'border-gray-200'}`}
                        />
                      </div>
                      <div>
                        <h3 className={`font-bold ${post.isAdmin ? 'text-green-800' : ''}`}>{post.title}</h3>
                        <p className="text-sm text-gray-500">
                          <span className={post.isAdmin ? forumStyles.adminAuthor : ''}>
                            {post.isAdmin ? 'Kidist Selassie Youth International Network' : (post.author?.name || 'Anonymous')}
                          </span> • {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <TranslatableText as="p" className="mb-4">{post.content}</TranslatableText>
                  
                    {/* Translate button */}
                    <button
                      onClick={() => {
                        const translatorElement = document.getElementById('comment-translator');
                        if (translatorElement) {
                          translatorElement.scrollIntoView({ behavior: 'smooth' });
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
                                alt={attachment.fileName}
                                className="rounded-lg w-full h-48 object-cover"
                                src={attachment.fileUrl}
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
                          multiple
                          accept="image/*,audio/*"
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
        
        {/* Right sidebar with verse of the day */}
        <div className="hidden md:block md:col-span-3">
          <div className="bg-[#064d32] rounded-lg p-4 shadow-md border border-[#086c47]">
            <h3 className="text-[#edcf08] font-bold text-lg mb-2">
              <span>Verse of the Day</span>
            </h3>
            <VerseOfTheDay />
          </div>
        </div>
      </div>
    </div>
  );
}
