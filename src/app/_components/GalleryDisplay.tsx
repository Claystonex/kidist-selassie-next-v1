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
  category: string;
  uploader: string;
  createdAt: string;
};

export default function GalleryDisplay() {
  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  useEffect(() => {
    // Extract unique categories when items are loaded
    if (allItems.length > 0) {
      const uniqueCategories = Array.from(new Set(allItems.map(item => item.category || 'Uncategorized')));
      setCategories(uniqueCategories);
    }
  }, [allItems]);

  useEffect(() => {
    let filtered = [...allItems];
    
    // Filter by media type
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === activeFilter);
    }
    
    // Filter by category
    if (activeCategoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === activeCategoryFilter);
    }
    
    setFilteredItems(filtered);
  }, [activeFilter, activeCategoryFilter, allItems]);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      
      // Try fetching from the API first (for backward compatibility)
      const res = await fetch('/api/gallery');
      
      if (res.ok) {
        const data = await res.json();
        setAllItems(data);
        setFilteredItems(data);
        if (data.length > 0 && !selectedItem) {
          setSelectedItem(data[0]);
        }
      } else {
        // If API fails, try getting data directly from the public JSON file
        const publicRes = await fetch('/data/gallery.json');
        if (publicRes.ok) {
          const data = await publicRes.json();
          setAllItems(data);
          setFilteredItems(data);
          if (data.length > 0 && !selectedItem) {
            setSelectedItem(data[0]);
          }
        } else {
          setError('Failed to load gallery items');
        }
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
      {/* Media Type Filter Tabs */}
      <div className={styles.filterTabs}>
        <button 
          className={`${styles.filterButton} ${activeFilter === 'all' ? styles.active : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Types
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
      
      {/* Category Filter Tabs - only show if categories are available */}
      {categories.length > 0 && (
        <div className={`${styles.filterTabs} mt-4`}>
          <button 
            className={`${styles.filterButton} ${activeCategoryFilter === 'all' ? styles.active : ''}`}
            onClick={() => setActiveCategoryFilter('all')}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button 
              key={category}
              className={`${styles.filterButton} ${activeCategoryFilter === category ? styles.active : ''}`}
              onClick={() => setActiveCategoryFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}

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
                {selectedItem.category && (
                  <p className={styles.mediaCategory}>
                    Category: {selectedItem.category}
                  </p>
                )}
                {selectedItem.uploader && (
                  <p className={styles.mediaUploader}>
                    {selectedItem.uploader}
                  </p>
                )}
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
              <div className="flex flex-wrap gap-1 mt-1">
                <span className={styles.itemType}>{item.type}</span>
                {item.category && (
                  <span className={`${styles.itemType} bg-green-500`}>{item.category}</span>
                )}
              </div>
              {item.uploader && (
                <span className="text-xs text-gray-500 italic mt-1 block">{item.uploader}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
