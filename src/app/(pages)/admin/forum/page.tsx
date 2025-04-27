'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/Admin.module.css';

type Attachment = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  postId: string;
  createdAt: string;
  audioDuration?: number | null;
};

type ForumPost = {
  id: string;
  title: string;
  content: string;
  type: string; // This represents the category in Prisma (PostType enum)
  createdAt: string;
  updatedAt: string;
  isAdmin: boolean;
  authorId: string;
  attachments: Attachment[];
};

export default function ForumAdmin() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Announcements');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPassword, setAuthPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/forum/admin');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched admin posts:', data);
        setPosts(data);
      } else {
        setError('Failed to load forum posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || !password) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('password', password);
      // No need to append author as it's handled by the server using the system user
      
      if (mediaFile) {
        formData.append('media', mediaFile);
      }
      
      const response = await fetch('/api/forum/admin', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        setMessage('Forum post added successfully!');
        setTitle('');
        setContent('');
        setMediaFile(null);
        setCategory('Announcements');
        fetchPosts();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add forum post');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!password) {
      setError('Password is required to delete a post');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/forum/admin', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, password }),
      });
      
      if (response.ok) {
        setMessage('Post deleted successfully!');
        fetchPosts();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete post');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authPassword) {
      setError('Please enter the admin password');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/forum/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: authPassword }),
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        setAuthPassword('');
        setError('');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Helper function to convert PostType enum to user-friendly category name
  const getCategoryFromType = (type: string) => {
    switch (type) {
      case 'GENERAL_DISCUSSION':
        return 'Announcements';
      case 'EDUCATIONAL':
        return 'Q&A';
      case 'DAILY_INSPIRATION':
        return 'Testimonies';
      case 'HUMOR':
        return 'Humor';
      default:
        return 'General';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.adminContainer}>
        <h1 className={styles.title}>Forum Admin Authentication</h1>
        
        <div className={styles.adminNav}>
          <a href="/admin/churchvideos">Videos Admin</a>
          <a href="/admin/users">User Management</a>
          <a href="/admin/verses">Verses Admin</a>
          <a href="/admin/gallery">Gallery Admin</a>
          <a href="/admin/email">Email Admin</a>
          <a href="/admin/forum" className={styles.active}>Forum Admin</a>
        </div>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleAuthentication} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="authPassword">Admin Password:</label>
            <input
              type="password"
              id="authPassword"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <h1 className={styles.title}>Forum Admin</h1>
      
      <div className={styles.adminNav}>
        <a href="/admin/churchvideos">Videos Admin</a>
        <a href="/admin/users">User Management</a>
        <a href="/admin/verses">Verses Admin</a>
        <a href="/admin/gallery">Gallery Admin</a>
        <a href="/admin/email">Email Admin</a>
        <a href="/admin/forum" className={styles.active}>Forum Admin</a>
      </div>
      
      {message && <div className={styles.success}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Post Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="content">Post Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="Announcements">Announcements</option>
            <option value="Q&A">Q&A</option>
            <option value="Events">Events</option>
            <option value="General">General</option>
            <option value="Testimonies">Testimonies</option>
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="mediaFile">Upload Media (audio/video - optional):</label>
          <input
            type="file"
            id="mediaFile"
            accept="audio/*,video/*"
            onChange={handleFileChange}
          />
          {mediaFile && (
            <div className={styles.fileInfo}>
              Selected file: {mediaFile.name} ({(mediaFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="password">Admin Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Posting...' : 'Add Forum Post'}
        </button>
      </form>
      
      <h2 className={styles.subtitle}>Manage Forum Posts</h2>
      
      {loading && <p>Loading...</p>}
      
      <div className={styles.postsList || styles.videosList}>
        {posts.length === 0 ? (
          <p>No official forum posts added yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className={styles.postItem || styles.videoItem}>
              <div className={styles.postInfo || styles.videoInfo}>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <p className={styles.postMeta || styles.videoMeta}>
                  <span>Category: {getCategoryFromType(post.type)}</span>
                  <span>Posted on: {formatDate(post.createdAt)}</span>
                  {post.attachments && post.attachments.length > 0 && (
                    <span>Media: {post.attachments[0]?.fileType === 'AUDIO' ? 'Audio' : 'Video/Other'} attached</span>
                  )}
                </p>
                <button
                  onClick={() => handleDelete(post.id)}
                  className={styles.deleteButton}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
