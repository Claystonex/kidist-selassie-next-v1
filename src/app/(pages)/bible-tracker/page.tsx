// File: /app/(pages)/bible-tracker/page.tsx
'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faCheckCircle, faPlus } from '@fortawesome/free-solid-svg-icons';

export default function BibleTrackerPage() {
  const [activeBook, setActiveBook] = useState<string | null>(null);
  
  // Example Bible books with chapters
  const bibleStructure = {
    'Genesis': 50,
    'Exodus': 40,
    'Leviticus': 27,
    'Numbers': 36,
    'Deuteronomy': 34,
    // More books can be added
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <FontAwesomeIcon icon={faBook} className="text-[#086c47] h-8 w-8 mr-3 animate-bounce" />
          <h1 className="text-3xl font-bold text-center">Bible Reading Tracker</h1>
        </div>
        
        <p className="text-center text-lg mb-12">
          Track your Bible reading progress. Mark chapters as read and follow your journey through Scripture.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {Object.entries(bibleStructure).map(([book, chapters]) => (
            <div 
              key={book}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div 
                className="bg-[#086c47] text-white p-4 cursor-pointer flex items-center justify-between"
                onClick={() => setActiveBook(activeBook === book ? null : book)}
              >
                <h3 className="font-bold">{book}</h3>
                <span className="text-sm">{chapters} chapters</span>
              </div>
              
              {activeBook === book && (
                <div className="p-4">
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: chapters as number }, (_, i) => i + 1).map(chapter => (
                      <button
                        key={chapter}
                        className="h-10 w-10 rounded-full bg-gray-100 hover:bg-[#f2f8f5] flex items-center justify-center text-sm transition-colors relative group"
                      >
                        {chapter}
                        <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 h-4 w-4" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="bg-[#f2f8f5] p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-[#086c47]">Your Reading Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-md shadow">
              <p className="text-sm text-gray-600">Books Started</p>
              <p className="text-2xl font-bold">0/66</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow">
              <p className="text-sm text-gray-600">Chapters Read</p>
              <p className="text-2xl font-bold">0/1,189</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow">
              <p className="text-sm text-gray-600">Reading Streak</p>
              <p className="text-2xl font-bold">0 days</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button className="bg-[#086c47] text-white px-4 py-2 rounded-md hover:bg-[#064e33] transition-colors flex items-center mx-auto">
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Reading Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
