// File: /app/(pages)/gallery/page.tsx
import React from 'react';
import GalleryDisplay from '@/app/_components/GalleryDisplay';

export const metadata = {
  title: 'Gallery - Kidist Selassie',
  description: 'View photos, videos, and audio from our community events and gatherings'
};

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Gallery</h1>
      <p className="text-center text-lg mb-8">
        Welcome to our media gallery showcasing fun, holistic, and spiritual activities from our community. 
        Browse through our collection of images, videos, and audio recordings.
      </p>
      <p className="text-center text-sm text-black-600 mb-8">
        Want to contribute? Email your submissions to <a href="mailto:selassieyouthtrinity@gmail.com" className="text-white hover:underline">selassieyouthtrinity@gmail.com</a>!
      </p>
      
      <GalleryDisplay />
    </div>
  );
}
