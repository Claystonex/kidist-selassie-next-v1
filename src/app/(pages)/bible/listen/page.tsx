'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import TranslatableText from '@/app/_components/TranslatableText';
import { useUser } from '@clerk/nextjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faVolumeUp, faUser, faClock } from '@fortawesome/free-solid-svg-icons';

interface Recording {
  id: string;
  bookId: number;
  bookName: string;
  chapterNumber: number;
  userId: string;
  userName: string;
  duration: number;
  fileUrl: string;
  createdAt: string;
}

export default function ListenBiblePage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [filteredRecordings, setFilteredRecordings] = useState<Recording[]>([]);
  const [books, setBooks] = useState<{id: number, name: string}[]>([]);
  const [selectedBook, setSelectedBook] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user } = useUser();

  useEffect(() => {
    fetchRecordings();
    fetchBooks();
  }, []);

  useEffect(() => {
    // Filter recordings when selectedBook changes
    if (selectedBook === 'all') {
      setFilteredRecordings(recordings);
    } else {
      setFilteredRecordings(recordings.filter(rec => rec.bookId === selectedBook));
    }
  }, [selectedBook, recordings]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bible/recordings');
      if (!response.ok) throw new Error('Failed to fetch Bible recordings');
      const data = await response.json();
      setRecordings(data);
      setFilteredRecordings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      setError('Failed to load Bible recordings. Please try again later.');
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/bible/books');
      if (!response.ok) throw new Error('Failed to fetch Bible books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleBookFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedBook(value === 'all' ? 'all' : parseInt(value));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const playRecording = (recordingId: string, fileUrl: string) => {
    // If we're already playing this recording, toggle play/pause
    if (currentlyPlaying === recordingId) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
      return;
    }

    // Otherwise, load and play the new recording
    setCurrentlyPlaying(recordingId);
    
    if (audioRef.current) {
      audioRef.current.src = fileUrl;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('Error playing audio:', err);
          setError('Failed to play this recording. Please try again.');
        });
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentlyPlaying(null);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#064d32]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-4">
            <TranslatableText>Listen to Bible Recordings</TranslatableText>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            <TranslatableText>
              Listen to Bible passages recorded by members of our community.
              Use the filter to find recordings for specific books.
            </TranslatableText>
          </p>
        </div>

        <div className="bg-[#043a26] rounded-lg shadow-xl p-6 mb-8">
          {/* Book filter */}
          <div className="mb-6">
            <label className="block text-yellow-300 mb-2 font-medium">
              <TranslatableText>Filter by Book</TranslatableText>
            </label>
            <select 
              className="w-full md:w-1/2 p-2 rounded bg-[#032a1c] text-white border border-[#0a8055]"
              onChange={handleBookFilterChange}
              value={selectedBook === 'all' ? 'all' : selectedBook}
            >
              <option value="all"><TranslatableText>All Books</TranslatableText></option>
              {books.map(book => (
                <option key={book.id} value={book.id}>{book.name}</option>
              ))}
            </select>
          </div>

          {/* Recordings list */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-white"><TranslatableText>Loading recordings...</TranslatableText></p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">{error}</p>
            </div>
          ) : filteredRecordings.length === 0 ? (
            <div className="text-center py-8 bg-[#032a1c] rounded-lg">
              <p className="text-white mb-4">
                <span>
                  <TranslatableText>No recordings found for </TranslatableText>{' '}
                  {selectedBook === 'all' 
                    ? <TranslatableText>any book</TranslatableText>
                    : books.find(b => b.id === selectedBook)?.name || <TranslatableText>this book</TranslatableText>}.
                </span>
              </p>
              <Link 
                href="/bible/record" 
                className="bg-[#edcf08] hover:bg-[#e6a037] text-[#064d32] font-bold py-2 px-4 rounded-lg transition-colors inline-block"
              >
                <TranslatableText>Record a Passage</TranslatableText>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecordings.map(recording => (
                <div 
                  key={recording.id}
                  className={`p-4 rounded-lg ${currentlyPlaying === recording.id 
                    ? 'bg-[#0a8055] border-2 border-yellow-400' 
                    : 'bg-[#032a1c] hover:bg-[#043a26]'} 
                    transition-colors cursor-pointer`}
                  onClick={() => playRecording(recording.id, recording.fileUrl)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-yellow-300 font-medium text-lg">
                        {recording.bookName} <span className="text-white">Chapter {recording.chapterNumber}</span>
                      </h3>
                      <div className="flex flex-wrap text-gray-300 text-sm mt-1 space-x-4">
                        <span className="flex items-center">
                          <FontAwesomeIcon icon={faUser} className="mr-1 h-3 w-3" />
                          {recording.userName}
                        </span>
                        <span className="flex items-center">
                          <FontAwesomeIcon icon={faClock} className="mr-1 h-3 w-3" />
                          {formatDuration(recording.duration)}
                        </span>
                        <span className="text-gray-400">
                          {formatDate(recording.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button 
                        className={`w-12 h-12 rounded-full ${
                          currentlyPlaying === recording.id 
                            ? 'bg-yellow-400 text-[#064d32]' 
                            : 'bg-[#064d32] text-yellow-400'
                        } flex items-center justify-center`}
                        aria-label={isPlaying && currentlyPlaying === recording.id ? "Pause" : "Play"}
                      >
                        <FontAwesomeIcon 
                          icon={isPlaying && currentlyPlaying === recording.id ? faPause : faPlay} 
                          className="h-4 w-4" 
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Audio player (hidden) */}
          <audio 
            ref={audioRef} 
            onEnded={handleAudioEnded}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            className="hidden"
          />

          {/* Navigation */}
          <div className="mt-8 text-center">
            <div className="inline-flex space-x-4">
              <Link 
                href="/bible" 
                className="text-yellow-300 hover:text-yellow-100 underline transition-colors"
              >
                <TranslatableText>Return to Bible</TranslatableText>
              </Link>
              <Link 
                href="/bible/record" 
                className="text-yellow-300 hover:text-yellow-100 underline transition-colors"
              >
                <TranslatableText>Record a Passage</TranslatableText>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
