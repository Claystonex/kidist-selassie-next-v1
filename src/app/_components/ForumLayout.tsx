'use client';

import React, { ReactNode } from 'react';
import StaticVerse from './StaticVerse';
import VerseOfTheDay from './VerseOfTheDay';

interface ForumLayoutProps {
  children: ReactNode;
}

export default function ForumLayout({ children }: ForumLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left sidebar with static verse - John 12:9-17 */}
        <div className="hidden md:block md:col-span-3">
          <StaticVerse />
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-6">
          {children}
        </div>
        
        {/* Right sidebar with verse of the day */}
        <div className="hidden md:block md:col-span-3">
          <div className="bg-[#064d32] rounded-lg p-4 shadow-md border border-[#086c47]">
            <h3 className="text-[#edcf08] font-bold text-lg mb-2">
              <span>Verse of the Day</span>
            </h3>
            <VerseOfTheDay />
          </div>
        </div>
      </div>
    </div>
  );
}
