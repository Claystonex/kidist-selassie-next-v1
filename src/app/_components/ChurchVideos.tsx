// File: /components/ChurchVideos.tsx
'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/ChurchVideos.module.css';

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

export default function ChurchVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/videos');
        
        if (res.ok) {
          const data = await res.json();
          setVideos(data);
          
          // Extract unique categories from videos
          const videoCategories = data.map((video: Video) => video.category || 'Uncategorized');
          const uniqueCategories = ['All', ...Array.from(new Set<string>(videoCategories))];
          setCategories(uniqueCategories);
          
          // Set filtered videos to all videos initially
          setFilteredVideos(data);
          
          if (data.length > 0) {
            setSelectedVideo(data[0]); // Select the first video by default
          }
        } else {
          setError('Failed to load videos');
        }
      } catch (err) {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);
  
  // Filter videos when category changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredVideos(videos);
    } else {
      const filtered = videos.filter(video => video.category === selectedCategory);
      setFilteredVideos(filtered);
      
      // Update selected video if it's not in the current filter
      if (filtered.length > 0) {
        if (selectedVideo && !filtered.some(v => v.id === selectedVideo.id)) {
          // Using a definite video (filtered[0]) and ensuring it's not undefined
          const firstFilteredVideo = filtered[0];
          setSelectedVideo(firstFilteredVideo || null);
        }
      } else {
        // No videos in this category
        setSelectedVideo(null);
      }
    }
  }, [selectedCategory, videos]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderEmbedHtml = (embedHtml: string) => {
    return {
      __html: embedHtml
        .replace('width="1920"', 'width="100%"')
        .replace('height="1080"', 'height="auto"')
    };
  };

  if (loading) return <div className={styles.loading}>Loading videos...</div>;
  
  if (error) return <div className={styles.error}>{error}</div>;
  
  if (videos.length === 0) return <div className={styles.noVideos}>No videos available at this time.</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Church Videos</h2>
      
      <div className={styles.categoryFilter}>
        <span className={styles.filterLabel}>Filter by Category:</span>
        <div className={styles.categoryButtons}>
          {categories.map(category => (
            <button 
              key={category}
              className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className={styles.videoGrid}>
        <div className={styles.mainVideo}>
          {selectedVideo && (
            <>
              <div 
                className={styles.videoPlayer}
                dangerouslySetInnerHTML={renderEmbedHtml(selectedVideo.embedUrl)} 
              />
              <div className={styles.videoDetails}>
                <h3 className={styles.videoTitle}>{selectedVideo.title}</h3>
                {selectedVideo.description && (
                  <p className={styles.videoDescription}>{selectedVideo.description}</p>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className={styles.videoList}>
          <h3 className={styles.listTitle}>More Videos</h3>
          {filteredVideos.map((video) => (
            <div 
              key={video.id} 
              className={`${styles.videoItem} ${selectedVideo?.id === video.id ? styles.selected : ''}`}
              onClick={() => setSelectedVideo(video)}
            >
              <div className={styles.thumbnail}>
                <img src={video.thumbnailUrl} alt={video.title} />
                <span className={styles.duration}>{formatDuration(video.duration)}</span>
              </div>
              <div className={styles.itemDetails}>
                <h4 className={styles.itemTitle}>{video.title}</h4>
                <span className={styles.itemDate}>
                  {new Date(video.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
