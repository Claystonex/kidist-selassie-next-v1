'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/Admin.module.css';

type GalleryItem = {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video' | 'audio';
  mediaUrl: string;
  thumbnailUrl: string;
  category: string;
  uploader: string;
  createdAt: string;
};

export default function GalleryAdmin() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'image' | 'video' | 'audio'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [vimeoUrl, setVimeoUrl] = useState('');
  const [category, setCategory] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPassword, setAuthPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchGalleryItems();
    }
  }, [isAuthenticated]);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery');
      if (response.ok) {
        const data = await response.json();
        setGalleryItems(data);
      } else {
        setError('Failed to load gallery items');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !type || !password) {
      setError('Please fill in all required fields');
      return;
    }
    
    // For video type, Vimeo URL is required
    if (type === 'video' && !vimeoUrl) {
      setError('Please provide a Vimeo URL for video content');
      return;
    }
    
    // For non-video types, media URL is required
    if (type !== 'video' && !mediaUrl) {
      setError('Please provide a media URL');
      return;
    }
    
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('type', type);
      formData.append('category', category);
      formData.append('password', password);
      
      // Add different fields based on media type
      if (type === 'video') {
        formData.append('vimeoUrl', vimeoUrl);
      } else {
        formData.append('mediaUrl', mediaUrl);
        if (thumbnailUrl) {
          formData.append('thumbnailUrl', thumbnailUrl);
        }
      }
      
      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        setMessage('Gallery item added successfully!');
        setTitle('');
        setDescription('');
        setMediaUrl('');
        setThumbnailUrl('');
        setVimeoUrl('');
        setCategory('');
        fetchGalleryItems();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add gallery item');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!password) {
      setError('Password is required to delete a gallery item');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this gallery item?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      setMessage(''); // Clear previous messages
      
      console.log('Sending delete request for ID:', id);
      
      const response = await fetch('/api/gallery', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, password }),
      });
      
      console.log('Delete response status:', response.status);
      
      const data = await response.json();
      console.log('Delete response data:', data);
      
      if (response.ok) {
        setMessage(`Gallery item deleted successfully! ${data.remainingItems} items remaining.`);
        fetchGalleryItems();
      } else {
        setError(`Failed to delete gallery item: ${data.error}${data.details ? ` (${data.details})` : ''}`);
      }
    } catch (err) {
      console.error('Error in delete operation:', err);
      setError(`Error connecting to server: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
      setError(''); // Clear previous errors
      
      // First, check if the verification endpoint is accessible
      try {
        const testResponse = await fetch('/api/gallery/verify', { method: 'GET' });
        console.log('API verification test:', testResponse.status);
      } catch (testErr) {
        console.warn('API verification test failed, will still try authentication:', testErr);
      }
      
      // Attempt password verification through API
      const response = await fetch('/api/gallery/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: authPassword }),
        // Add cache: 'no-store' to prevent caching issues
        cache: 'no-store',
      });
      
      // Handle potential Next.js 404 error by also allowing direct password check as fallback
      if (response.status === 404) {
        // Fallback in case API route isn't working
        console.warn('Verification API not found, using direct password comparison');
        if (authPassword === 'Youth100') {
          setIsAuthenticated(true);
          setPassword(authPassword);
          return;
        } else {
          setError('Incorrect password');
          return;
        }
      }
      
      // Normal API response handling
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
          setPassword(authPassword); // Set the main password field to reuse for other operations
          console.log('Authentication successful');
        } else {
          setError(data.error || 'Authentication failed');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setError(errorData.error || `Server error: ${response.status}`);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Error connecting to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMediaPreview = (item: GalleryItem) => {
    if (item.type === 'image') {
      return (
        <img 
          src={item.mediaUrl} 
          alt={item.title} 
          className="w-full h-48 object-cover rounded-md" 
        />
      );
    } else if (item.type === 'video') {
      return (
        <video 
          src={item.mediaUrl} 
          controls 
          className="w-full h-48 object-cover rounded-md"
        >
          Your browser does not support the video tag.
        </video>
      );
    } else if (item.type === 'audio') {
      return (
        <div className="w-full bg-gray-100 p-4 rounded-md flex items-center justify-center">
          <audio 
            src={item.mediaUrl} 
            controls 
            className="w-full"
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }
    return null;
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Gallery Admin</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleAuthentication} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="authPassword">Enter Admin Password:</label>
            <input
              type="password"
              id="authPassword"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gallery Admin</h1>
      
      {message && <div className={styles.success}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="description">Description (optional):</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="type">Media Type:</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as 'image' | 'video' | 'audio')}
            required
          >
            <option value="image">Image</option>
            <option value="video">Vimeo Video</option>
            <option value="audio">Audio</option>
          </select>
          {type === 'video' && (
            <small className="block mt-1 text-blue-600">
              For videos, you must first upload your video to Vimeo and then paste the URL here.
            </small>
          )}
          {type !== 'video' && (
            <small className="block mt-1">
              For images and audio, provide a direct URL to the media file.
            </small>
          )}
        </div>
        
        {type === 'video' ? (
          <div className={styles.formGroup}>
            <label htmlFor="vimeoUrl">Vimeo URL:</label>
            <input
              type="text"
              id="vimeoUrl"
              value={vimeoUrl}
              onChange={(e) => setVimeoUrl(e.target.value)}
              placeholder="https://vimeo.com/123456789"
              required={true}
            />
            <small>URL to your video on Vimeo (e.g., https://vimeo.com/123456789)</small>
          </div>
        ) : (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="mediaUrl">Media URL:</label>
              <input
                type="text"
                id="mediaUrl"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                required={true}
              />
              <small>Direct link to the media file (image or audio)</small>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="thumbnailUrl">Thumbnail URL (optional):</label>
              <input
                type="text"
                id="thumbnailUrl"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
              />
              <small>For images, leave blank to use the same URL</small>
            </div>
          </>
        )}
        
        <div className={styles.formGroup}>
          <label htmlFor="category">Category:</label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Worship, Teachings, Events, etc."
          />
          <small>Will be tagged as "Uploaded by Selassie Youth" automatically</small>
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
          {loading ? 'Adding...' : 'Add New Item'}
        </button>
      </form>
      
      <h2 className={styles.subtitle}>Manage Gallery</h2>
      
      {loading && <p>Loading...</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {galleryItems.length === 0 ? (
          <p>No gallery items added yet.</p>
        ) : (
          galleryItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                {renderMediaPreview(item)}
                <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs uppercase">
                  {item.type}
                </span>
                {item.category && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs">
                    {item.category}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg truncate">{item.title}</h3>
                {item.description && (
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  Added on: {new Date(item.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-500 text-xs mt-1 italic">
                  {item.uploader || 'Uploaded by Selassie Youth'}
                </p>
                <button
                  onClick={() => handleDelete(item.id)}
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
