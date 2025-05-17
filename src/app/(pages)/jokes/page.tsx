'use client';

import React, { useState, useEffect, useRef } from 'react';
import AudioRecorder from '@/app/_components/AudioRecorder/AudioRecorder';
import VideoRecorder from '@/app/_components/VideoRecorder/VideoRecorder';

interface Joke {
  id: string;
  content: string;
  userName: string;
  timestamp: string;
  hasAudio?: boolean;
  audioUrl?: string | null;
  audioDuration?: number;
  hasVideo?: boolean;
  videoUrl?: string | null;
  videoDuration?: number;
}

const JokesPage = () => {
  const [jokeContent, setJokeContent] = useState('');
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchJokes();
  }, []);

  const fetchJokes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jokes');
      if (!response.ok) throw new Error('Failed to fetch jokes');
      const data = await response.json();
      setJokes(data);
    } catch (error) {
      console.error('Error fetching jokes:', error);
      // If API isn't ready yet, use sample data
      setJokes([
        {
          id: '1',
          content: 'Why did the Orthodox priest carry a ladder? To reach new spiritual heights!',
          timestamp: new Date().toISOString(),
          userName: 'Faithful Joker'
        },
        {
          id: '2',
          content: 'What do you call a group of Orthodox youth singing together? A divine choir-us!',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          userName: 'Melody Maker'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Allow either voice/video recording OR text joke, not requiring both
    if (!audioBlob && !videoBlob && !jokeContent.trim()) {
      setError('Please either record or type a joke');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Submit with video if available
      if (videoBlob) {
        const formData = new FormData();
        formData.append('jokeContent', jokeContent || 'Video joke'); // Use placeholder text if not provided
        formData.append('video', videoBlob);
        formData.append('duration', videoDuration.toString());
        
        const response = await fetch('/api/jokes/video/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Failed to submit joke with video');
        
        // Reset video state
        setVideoBlob(null);
        setShowVideoRecorder(false);
      }
      // Submit with audio if available
      else if (audioBlob) {
        const formData = new FormData();
        formData.append('jokeContent', jokeContent || 'Voice joke'); // Use placeholder text if not provided
        formData.append('audio', audioBlob);
        formData.append('duration', audioDuration.toString());
        
        const response = await fetch('/api/jokes/audio/upload', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to submit joke with audio');
        }
        
        // Show warning if there was one
        if (result.warning) {
          setSuccess(`Your joke has been shared, but ${result.warning}`);
        }
        
        // Reset audio state
        setAudioBlob(null);
        setShowAudioRecorder(false);
      } else {
        // Regular text-only joke submission
        const response = await fetch('/api/jokes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: jokeContent,
          }),
        });

        if (!response.ok) throw new Error('Failed to submit joke');
      }

      setSuccess('Your joke has been shared with the community!');
      setJokeContent('');
      fetchJokes();
    } catch (error) {
      console.error('Error submitting joke:', error);
      setError('Failed to submit your joke. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveAudio = (blob: Blob, duration: number) => {
    setAudioBlob(blob);
    setAudioDuration(duration);
    // Clear video if audio is saved
    setVideoBlob(null);
  };
  
  const handleCancelAudio = () => {
    setShowAudioRecorder(false);
    setAudioBlob(null);
  };
  
  const handleSaveVideo = (blob: Blob, duration: number) => {
    setVideoBlob(blob);
    setVideoDuration(duration);
    // Clear audio if video is saved
    setAudioBlob(null);
  };
  
  const handleCancelVideo = () => {
    setShowVideoRecorder(false);
    setVideoBlob(null);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#086c47]">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-yellow-400 mb-8">Community Jokes</h1>
        
        {/* Joke Submission Form */}
        <div className="bg-[#064d32] rounded-lg shadow-xl p-6 mb-8">
          {error && <div className="mb-4 p-3 bg-red-500 bg-opacity-20 text-white rounded">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-500 bg-opacity-20 text-white rounded">{success}</div>}
          
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">Share a Joke</h2>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="joke-content" className="block text-sm font-medium text-gray-300">Your Joke</label>
              <div className="mt-1">
                <textarea
                  id="joke-content"
                  name="jokeContent"
                  value={jokeContent}
                  onChange={(e) => setJokeContent(e.target.value)}
                  rows={4}
                  placeholder={videoBlob ? "Video recording will be used" : audioBlob ? "Voice recording will be used" : "Share a clean, family-friendly joke..."}
                  disabled={!!audioBlob || !!videoBlob}
                  className="mt-1 block w-full rounded-md bg-white border-transparent focus:border-yellow-500 focus:ring-0 text-black"
                />
              </div>
            </div>

            {/* Recording Controls */}
            <div className="flex flex-col space-y-4 mt-4">
              {/* Audio Recorder */}
              {showAudioRecorder ? (
                <div className="p-4 bg-[#053a27] rounded-lg border border-yellow-400 border-opacity-30">
                  <h3 className="text-yellow-400 text-sm font-medium mb-2">Record Your Voice Joke</h3>
                  <AudioRecorder 
                    onSave={handleSaveAudio} 
                    onCancel={handleCancelAudio} 
                  />
                  {audioBlob && (
                    <p className="text-green-300 text-xs mt-2">
                      Audio recording ready! Submit your joke to share it.
                      <button 
                        type="button" 
                        onClick={() => {
                          setAudioBlob(null);
                          setJokeContent('');
                        }}
                        className="ml-2 text-xs text-red-300 underline"
                      >
                        Remove recording to type instead
                      </button>
                    </p>
                  )}
                </div>
              ) : !videoBlob && !showVideoRecorder && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAudioRecorder(true);
                    setShowVideoRecorder(false);
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-white rounded-md shadow-sm text-sm font-medium text-white bg-transparent hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
                >
                  Record your Funny Audio
                </button>
              )}

              {/* Video Recorder */}
              {showVideoRecorder ? (
                <div className="p-4 bg-[#053a27] rounded-lg border border-yellow-400 border-opacity-30">
                  <h3 className="text-yellow-400 text-sm font-medium mb-2">Record Your Video Joke</h3>
                  <VideoRecorder 
                    onSave={handleSaveVideo} 
                    onCancel={handleCancelVideo} 
                  />
                  {videoBlob && (
                    <p className="text-green-300 text-xs mt-2">
                      Video recording ready! Submit your joke to share it.
                      <button 
                        type="button" 
                        onClick={() => {
                          setVideoBlob(null);
                          setJokeContent('');
                        }}
                        className="ml-2 text-xs text-red-300 underline"
                      >
                        Remove recording to type instead
                      </button>
                    </p>
                  )}
                </div>
              ) : !audioBlob && !showAudioRecorder && (
                <button
                  type="button"
                  onClick={() => {
                    setShowVideoRecorder(true);
                    setShowAudioRecorder(false);
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-white rounded-md shadow-sm text-sm font-medium text-white bg-transparent hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
                >
                  Record your Funny Video
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Share Joke'}
            </button>
          </form>
        </div>

        {/* Jokes Display */}
        <div className="bg-[#064d32] border border-[#c4142c] rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">Latest Jokes</h2>
          
          {loading && <p className="text-white">Loading jokes...</p>}
          
          <div className="space-y-6">
            {jokes.length > 0 ? (
              jokes.map((joke) => (
                <div key={joke.id} className="bg-white/10 rounded-lg p-4">
                  <p className="text-lg text-white">"{joke.content}"</p>
                  
                  {joke.hasVideo && joke.videoUrl && (
                    <div className="mt-3 bg-[#053a27] p-2 rounded">
                      <video
                        src={joke.videoUrl}
                        controls
                        className="w-full"
                        controlsList="nodownload"
                      />
                      <div className="text-xs text-yellow-200 mt-1">
                        {joke.videoDuration ? `${Math.floor(joke.videoDuration / 60)}:${(joke.videoDuration % 60).toString().padStart(2, '0')}` : ''} Video Recording
                      </div>
                    </div>
                  )}
                  
                  {joke.hasAudio && joke.audioUrl && (
                    <div className="mt-3 bg-[#053a27] p-2 rounded">
                      <audio 
                        src={joke.audioUrl} 
                        controls 
                        className="w-full"
                        controlsList="nodownload"
                      />
                      <div className="text-xs text-yellow-200 mt-1">
                        {joke.audioDuration ? `${Math.floor(joke.audioDuration / 60)}:${(joke.audioDuration % 60).toString().padStart(2, '0')}` : ''} Voice Recording
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2 text-sm text-gray-400">
                    Shared by {joke.userName} on {new Date(joke.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white">No jokes have been shared yet. Be the first to share one!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JokesPage;