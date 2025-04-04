// File: /app/(pages)/admin/churchvideos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/Admin.module.css';

type Video = {
  id: string;
  title: string;
  description: string;
  vimeoId: string;
  thumbnailUrl: string;
  embedUrl: string;
  duration: number;
  createdAt: string;
  category: string;
};

export default function VideoAdmin() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vimeoUrl, setVimeoUrl] = useState('');
  const [category, setCategory] = useState('Sermons');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPassword, setAuthPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchVideos();
    }
  }, [isAuthenticated]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/videos');
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      } else {
        setError('Failed to load videos');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !vimeoUrl || !password) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title, 
          description, 
          vimeoUrl, 
          category,
          password 
        }),
      });
      
      if (response.ok) {
        setMessage('Video added successfully!');
        setTitle('');
        setDescription('');
        setVimeoUrl('');
        setCategory('Sermons');
        fetchVideos();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add video');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!password) {
      setError('Password is required to delete a video');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/videos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, password }),
      });
      
      if (response.ok) {
        setMessage('Video deleted successfully!');
        fetchVideos();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete video');
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
      const response = await fetch('/api/videos/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: authPassword }),
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        setPassword(authPassword); // Set the main password field to reuse for other operations
        setError(''); // Clear any errors
      } else {
        const data = await response.json();
        setError(data.error || 'Incorrect password');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Church Videos Admin</h1>
        
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
      <h1 className={styles.title}>Church Videos Admin</h1>
      
      {message && <div className={styles.success}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Video Title:</label>
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
          <label htmlFor="vimeoUrl">Vimeo URL (e.g., https://vimeo.com/123456789):</label>
          <input
            type="text"
            id="vimeoUrl"
            value={vimeoUrl}
            onChange={(e) => setVimeoUrl(e.target.value)}
            placeholder="https://vimeo.com/123456789"
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="category">Video Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="Sermons">Sermons</option>
            <option value="Bible Studies">Bible Studies</option>
            <option value="Holidays">Holidays</option>
            <option value="Youth Ministry">Youth Ministry</option>
            <option value="Special Events">Special Events</option>
          </select>
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
          {loading ? 'Adding...' : 'Add New Video'}
        </button>
      </form>
      
      <h2 className={styles.subtitle}>Manage Videos</h2>
      
      {loading && <p>Loading...</p>}
      
      <div className={styles.videosList || styles.versesList}>
        {videos.length === 0 ? (
          <p>No videos added yet.</p>
        ) : (
          videos.map((video) => (
            <div key={video.id} className={styles.videoItem || styles.verseItem}>
              <div className={styles.videoThumbnail}>
                <img src={video.thumbnailUrl} alt={video.title} />
              </div>
              <div className={styles.videoInfo}>
                <h3>{video.title}</h3>
                {video.description && <p>{video.description}</p>}
                <p className={styles.videoMeta}>
                  <span>Duration: {formatDuration(video.duration)}</span>
                  <span className={styles.category}>
                    Category: {video.category || 'Uncategorized'}
                  </span>
                  <span className={styles.date}>
                    Added on: {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </p>
                <button
                  onClick={() => handleDelete(video.id)}
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
