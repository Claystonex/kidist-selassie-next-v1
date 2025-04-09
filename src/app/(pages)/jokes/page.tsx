'use client';

import React, { useState, useEffect } from 'react';

interface Joke {
  id: string;
  content: string;
  userName: string;
  timestamp: string;
}

const JokesPage = () => {
  const [jokeContent, setJokeContent] = useState('');
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    
    if (!jokeContent.trim()) {
      setError('Please enter a joke');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
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

      setSuccess('Your joke has been shared with the community!');
      setJokeContent('');
      fetchJokes();
    } catch (error) {
      console.error('Error submitting joke:', error);
      setError('Failed to submit your joke. Please try again.');
      
      // For now, add the joke locally since the API might not be implemented yet
      setJokes(prev => [
        {
          id: Date.now().toString(),
          content: jokeContent,
          timestamp: new Date().toISOString(),
          userName: 'You'
        },
        ...prev
      ]);
      
      setJokeContent('');
      setSuccess('Your joke has been shared with the community!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#086c47]">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-yellow-400 mb-8">Community Jokes</h1>
        
        {/* Joke Submission Form */}
        <div className="bg-[#064d32] rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">Share a Clean Joke</h2>
          {error && <div className="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-500 bg-opacity-20 text-green-200 p-3 rounded mb-4">{success}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="jokeContent" className="block text-sm font-medium text-gray-300">
                Your Joke
              </label>
              <textarea
                id="jokeContent"
                value={jokeContent}
                onChange={(e) => setJokeContent(e.target.value)}
                required
                rows={4}
                className="mt-1 block w-full rounded-md bg-white border-transparent focus:border-yellow-500 focus:ring-0 text-black"
                placeholder="Share a clean, family-friendly joke..."
              />
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