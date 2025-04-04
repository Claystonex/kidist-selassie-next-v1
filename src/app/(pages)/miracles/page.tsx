'use client';

import React, { useState, useEffect } from 'react';

interface Miracle {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  userName: string;
}

const MiraclesPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [miracles, setMiracles] = useState<Miracle[]>([]);

  useEffect(() => {
    fetchMiracles();
  }, []);

  const fetchMiracles = async () => {
    try {
      const response = await fetch('/api/miracles');
      if (!response.ok) throw new Error('Failed to fetch miracles');
      const data = await response.json();
      setMiracles(data);
    } catch (error) {
      console.error('Error fetching miracles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/miracles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit miracle testimony');

      // Clear form
      setTitle('');
      setDescription('');

      // Refresh the miracles list
      fetchMiracles();
    } catch (error) {
      console.error('Error submitting miracle testimony:', error);
      alert('Failed to submit miracle testimony. Please try again.');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Miracle Testimony Form */}
        <div className="bg-[#086c47] rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">Share Your Miracle</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                Miracle Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full rounded-md bg-white border-transparent focus:border-yellow-500 focus:ring-0 text-black"
                placeholder="E.g., Healing from Chronic Pain"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Share Your Testimony
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="mt-1 block w-full rounded-md bg-white border-transparent focus:border-yellow-500 focus:ring-0 text-black"
                placeholder="Share the details of your miracle testimony..."
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Share Testimony
            </button>
          </form>
        </div>

        {/* Featured Miracle Video */}
        <div className="bg-[#086c47] rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">Featured Miracle Testimony</h2>
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.youtube.com/embed/Hb66U9bdN3c"
              title="Miracle Testimony"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full rounded-lg shadow-lg"
              style={{ aspectRatio: '16/9', maxHeight: '450px' }}
            ></iframe>
          </div>
        </div>

        {/* Miracles Display */}
        <div className="bg-[#086c47] border border-[#c4142c] rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">Miracle Testimonies</h2>
          <div className="space-y-6">
            {miracles.map((miracle) => (
              <div key={miracle.id} className="bg-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white">{miracle.title}</h3>
                <p className="text-gray-300 mt-2">{miracle.description}</p>
                <div className="mt-2 text-sm text-gray-400">
                  Shared by {miracle.userName} on {new Date(miracle.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiraclesPage;