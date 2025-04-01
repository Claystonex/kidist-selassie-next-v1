'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/Gallery.module.css';

type GalleryItem = {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video' | 'audio';
  mediaUrl: string;
  thumbnailUrl: string;
  createdAt: string;
};

export default function GalleryDisplay() {
  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredItems(allItems);
    } else {
      setFilteredItems(allItems.filter(item => item.type === activeFilter));
    }
  }, [activeFilter, allItems]);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gallery');
      
      if (res.ok) {
        const data = await res.json();
        setAllItems(data);
        setFilteredItems(data);
        if (data.length > 0 && !selectedItem) {
          setSelectedItem(data[0]);
        }
      } else {
        setError('Failed to load gallery items');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const renderMediaContent = (item: GalleryItem, fullSize = false) => {
    const className = fullSize 
      ? "w-full rounded-lg" 
      : "w-full h-48 object-cover rounded-lg";

    if (item.type === 'image') {
      return (
        <img 
          src={item.mediaUrl} 
          alt={item.title} 
          className={className}
          loading="lazy"
        />
      );
    } else if (item.type === 'video') {
      return (
        <video 
          src={item.mediaUrl} 
          controls
          className={className}
          poster={item.thumbnailUrl}
        >
          Your browser does not support the video tag.
        </video>
      );
    } else if (item.type === 'audio') {
      return (
        <div className="w-full bg-gray-100 p-4 rounded-lg flex flex-col items-center">
          <img 
            src={item.thumbnailUrl} 
            alt={item.title} 
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
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

  if (loading) return <div className={styles.loading}>Loading gallery...</div>;
  
  if (error) return <div className={styles.error}>{error}</div>;
  
  if (filteredItems.length === 0) {
    return (
      <div className={styles.noItems}>
        {activeFilter === 'all' 
          ? "No gallery items available at this time." 
          : `No ${activeFilter} items available at this time.`}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        <button 
          className={`${styles.filterButton} ${activeFilter === 'all' ? styles.active : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button 
          className={`${styles.filterButton} ${activeFilter === 'image' ? styles.active : ''}`}
          onClick={() => setActiveFilter('image')}
        >
          Images
        </button>
        <button 
          className={`${styles.filterButton} ${activeFilter === 'video' ? styles.active : ''}`}
          onClick={() => setActiveFilter('video')}
        >
          Videos
        </button>
        <button 
          className={`${styles.filterButton} ${activeFilter === 'audio' ? styles.active : ''}`}
          onClick={() => setActiveFilter('audio')}
        >
          Audio
        </button>
      </div>

      {/* Modal for selected media */}
      {selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelectedItem(null)}>
              &times;
            </button>
            <div className={styles.modalContent}>
              <div className={styles.mediaContainer}>
                {renderMediaContent(selectedItem, true)}
              </div>
              <div className={styles.mediaInfo}>
                <h3 className={styles.mediaTitle}>{selectedItem.title}</h3>
                {selectedItem.description && (
                  <p className={styles.mediaDescription}>{selectedItem.description}</p>
                )}
                <p className={styles.mediaDate}>
                  Added on: {new Date(selectedItem.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className={styles.galleryGrid}>
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className={styles.galleryItem}
            onClick={() => setSelectedItem(item)}
          >
            <div className={styles.mediaThumb}>
              {item.type === 'image' ? (
                <img src={item.mediaUrl} alt={item.title} className={styles.thumbnail} />
              ) : item.type === 'video' ? (
                <div className={styles.videoThumb}>
                  <img src={item.thumbnailUrl} alt={item.title} className={styles.thumbnail} />
                  <div className={styles.playButton}>▶</div>
                </div>
              ) : (
                <div className={styles.audioThumb}>
                  <img src={item.thumbnailUrl} alt={item.title} className={styles.thumbnail} />
                  <div className={styles.audioIcon}>🎵</div>
                </div>
              )}
            </div>
            <div className={styles.itemInfo}>
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <span className={styles.itemType}>{item.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
