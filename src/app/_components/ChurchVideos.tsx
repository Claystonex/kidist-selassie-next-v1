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
};

export default function ChurchVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
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
          {videos.map((video) => (
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
