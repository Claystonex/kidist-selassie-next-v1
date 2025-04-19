'use client';

import { useState, useEffect } from 'react';
import TranslatableText from '@/app/_components/TranslatableText';

type Teaching = {
  id: string;
  title: string;
  description: string | null;
  priestName: string;
  mediaType: string;
  mediaUrl: string;
  vimeoId: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  category: string;
  createdAt: string;
};

export default function TeachingDisplay() {
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [filteredTeachings, setFilteredTeachings] = useState<Teaching[]>([]);
  const [selectedTeaching, setSelectedTeaching] = useState<Teaching | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeachings = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/teachings');
        
        if (res.ok) {
          const data = await res.json();
          setTeachings(data);
          
          // Extract unique categories from teachings
          const teachingCategories = data.map((teaching: Teaching) => teaching.category || 'Uncategorized');
          const uniqueCategories = ['All', ...Array.from(new Set<string>(teachingCategories))];
          setCategories(uniqueCategories);
          
          // Set filtered teachings to all teachings initially
          setFilteredTeachings(data);
          
          if (data.length > 0) {
            setSelectedTeaching(data[0]); // Select the first teaching by default
          }
        } else {
          setError('Failed to load teachings');
        }
      } catch (err) {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachings();
  }, []);
  
  // Filter teachings when category changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredTeachings(teachings);
    } else {
      const filtered = teachings.filter(teaching => teaching.category === selectedCategory);
      setFilteredTeachings(filtered);
      
      // Update selected teaching if it's not in the current filter
      if (filtered.length > 0) {
        if (selectedTeaching && !filtered.some(t => t.id === selectedTeaching.id)) {
          const firstFilteredTeaching = filtered[0];
          setSelectedTeaching(firstFilteredTeaching || null);
        }
      } else {
        // No teachings in this category
        setSelectedTeaching(null);
      }
    }
  }, [selectedCategory, teachings, selectedTeaching]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderMediaContent = (teaching: Teaching) => {
    if (teaching.mediaType === 'video' && teaching.vimeoId) {
      // Render Vimeo player for videos
      return (
        <div className="relative pt-[56.25%] w-full">
          <iframe
            src={`https://player.vimeo.com/video/${teaching.vimeoId}?title=0&byline=0&portrait=0`}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={teaching.title}
          ></iframe>
        </div>
      );
    } else if (teaching.mediaType === 'audio') {
      // Render audio player
      return (
        <div className="bg-gray-100 p-4 rounded-lg">
          <audio 
            controls 
            src={teaching.mediaUrl}
            className="w-full"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    } else {
      // Fallback for other media types
      return (
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <p><TranslatableText>Media not available in preview.</TranslatableText></p>
          <a 
            href={teaching.mediaUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            <TranslatableText>Open media in new tab</TranslatableText>
          </a>
        </div>
      );
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="text-lg"><TranslatableText>Loading teachings...</TranslatableText></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-100 text-red-700 p-4 rounded-lg">
      <TranslatableText>{error}</TranslatableText>
    </div>
  );
  
  if (teachings.length === 0) return (
    <div className="text-center py-8">
      <TranslatableText>No teachings available at this time.</TranslatableText>
    </div>
  );

  return (
    <div className="container mx-auto">
      {/* Category filter */}
      <div className="flex flex-wrap justify-center mb-8">
        <div className="w-full text-center mb-2">
          <h2 className="text-lg font-semibold"><TranslatableText>Filter by Category:</TranslatableText></h2>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(category => (
            <button 
              key={category}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content area - selected teaching */}
        <div className="lg:col-span-2">
          {selectedTeaching ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Media player */}
              <div className="w-full">
                {renderMediaContent(selectedTeaching)}
              </div>
              
              {/* Teaching details */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedTeaching.title}</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {selectedTeaching.category}
                  </span>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="font-medium text-gray-600">
                    <TranslatableText>By:</TranslatableText> {selectedTeaching.priestName}
                  </div>
                  <div className="mx-4 text-gray-300">|</div>
                  <div className="text-gray-500 text-sm">
                    {new Date(selectedTeaching.createdAt).toLocaleDateString()}
                  </div>
                  {selectedTeaching.duration && (
                    <>
                      <div className="mx-4 text-gray-300">|</div>
                      <div className="text-gray-500 text-sm">
                        {formatDuration(selectedTeaching.duration)}
                      </div>
                    </>
                  )}
                </div>
                
                {selectedTeaching.description && (
                  <div className="mt-4 text-gray-700">
                    {selectedTeaching.description}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-500"><TranslatableText>No teaching selected.</TranslatableText></p>
            </div>
          )}
        </div>
        
        {/* Sidebar - teaching list */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-bold text-lg mb-4 text-gray-800">
              <TranslatableText>All Teachings</TranslatableText>
              {selectedCategory !== 'All' && ` - ${selectedCategory}`}
            </h3>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredTeachings.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  <TranslatableText>No teachings in this category.</TranslatableText>
                </p>
              ) : (
                filteredTeachings.map(teaching => (
                  <div 
                    key={teaching.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTeaching?.id === teaching.id 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                    }`}
                    onClick={() => setSelectedTeaching(teaching)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail for videos, icon for audio */}
                      <div className="flex-shrink-0 w-24 h-16 relative rounded overflow-hidden bg-gray-200">
                        {teaching.thumbnailUrl ? (
                          <img 
                            src={teaching.thumbnailUrl} 
                            alt={teaching.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <svg className="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              {teaching.mediaType === 'audio' ? (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 5.168A1 1 0 008 6v8a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4z" clipRule="evenodd" />
                              ) : (
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z" clipRule="evenodd" />
                              )}
                            </svg>
                          </div>
                        )}
                        {teaching.duration && (
                          <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5">
                            {formatDuration(teaching.duration)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                          {teaching.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {teaching.priestName}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(teaching.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
