'use client';

import React, { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import TranslatableText from '@/app/_components/TranslatableText';

interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  isPrivate: boolean;
  timestamp: string;
  userName: string;
}

const PrayerPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [showPrivateTooltip, setShowPrivateTooltip] = useState(false);

  useEffect(() => {
    fetchPrayers();
  }, []);

  const fetchPrayers = async () => {
    try {
      const response = await fetch('/api/prayers');
      if (!response.ok) throw new Error('Failed to fetch prayers');
      const data = await response.json();
      setPrayerRequests(data);
    } catch (error) {
      console.error('Error fetching prayers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/prayers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          isPrivate,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit prayer');

      // Clear form
      setTitle('');
      setDescription('');
      setIsPrivate(false);

      // Refresh the prayer list if the new prayer is public
      if (!isPrivate) {
        fetchPrayers();
      }
    } catch (error) {
      console.error('Error submitting prayer:', error);
      alert('Failed to submit prayer request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Prayer Request Form */}
        <div className="bg-[#086c47] rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6"><TranslatableText>Submit a Prayer Request</TranslatableText></h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                <TranslatableText>Prayer Title</TranslatableText>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full rounded-md bg-white border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                <TranslatableText>Prayer Description</TranslatableText>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="mt-1 block w-full rounded-md bg-white border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 text-gray-900"
              />
            </div>

            {/* Toggle Buttons - Improved for mobile */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:space-x-6">
              {/* Private Toggle */}
              <div className="relative w-full sm:w-auto" onMouseEnter={() => setShowPrivateTooltip(true)} onMouseLeave={() => setShowPrivateTooltip(false)}>
                <div className={`p-3 rounded-lg ${isPrivate ? 'bg-yellow-400/10' : 'bg-gray-700'} w-full`}>
                  <div className="flex items-center justify-between sm:justify-start sm:space-x-3">
                    <Switch
                      checked={isPrivate}
                      onChange={(checked) => {
                        setIsPrivate(checked);
                      }}
                      className={`${isPrivate ? 'bg-yellow-400' : 'bg-[#c4142c]'}
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                    >
                      <span className="sr-only"><TranslatableText>Private Prayer</TranslatableText></span>
                      <span
                        className={`${isPrivate ? 'translate-x-6' : 'translate-x-1'}
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                    <span className={`text-sm ${isPrivate ? 'text-yellow-400' : 'text-gray-300'} ml-3`}><TranslatableText>Private Prayer</TranslatableText></span>
                  </div>
                </div>

                {showPrivateTooltip && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-700 text-white text-sm rounded-lg p-2 shadow-lg z-10">
                    <TranslatableText>Private prayers will only be visible to our prayer team and won't be displayed publicly on the website.</TranslatableText>
                  </div>
                )}
              </div>

              {/* Public Toggle */}
              <div className="relative w-full sm:w-auto">
                <div className={`p-3 rounded-lg ${!isPrivate ? 'bg-yellow-400/10' : 'bg-gray-700'} w-full`}>
                  <div className="flex items-center justify-between sm:justify-start sm:space-x-3">
                    <Switch
                      checked={!isPrivate}
                      onChange={(checked) => {
                        setIsPrivate(!checked);
                      }}
                      className={`${!isPrivate ? 'bg-yellow-400' : 'bg-[#c4142c]'}
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                    >
                      <span className="sr-only"><TranslatableText>Public Prayer</TranslatableText></span>
                      <span
                        className={`${!isPrivate ? 'translate-x-6' : 'translate-x-1'}
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                    <span className={`text-sm ${!isPrivate ? 'text-yellow-400' : 'text-gray-300'} ml-3`}><TranslatableText>Public Prayer</TranslatableText></span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <TranslatableText>Submit Prayer Request</TranslatableText>
            </button>
          </form>
        </div>

        {/* Public Prayer Requests Display */}
        <div className="bg-[#086c47] border border-[#c4142c] rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6"><TranslatableText>Public Prayer Requests</TranslatableText></h2>
          <div className="space-y-6">
            {prayerRequests.map((prayer) => (
              <div key={prayer.id} className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white"><TranslatableText>{prayer.title}</TranslatableText></h3>
                <p className="text-gray-300 mt-2"><TranslatableText>{prayer.description}</TranslatableText></p>
                <div className="mt-2 text-sm text-gray-400">
                  <TranslatableText>Requested by</TranslatableText> {prayer.userName} <TranslatableText>on</TranslatableText> {new Date(prayer.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerPage;  