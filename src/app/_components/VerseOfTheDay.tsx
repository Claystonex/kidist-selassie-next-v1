// File: /components/VerseOfTheDay.tsx
'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/VerseOfTheDay.module.css'; // Create this CSS file

type Verse = {
  id: string;
  title: string;
  scripture: string;
  createdAt: string;
} | null;

export default function VerseOfTheDay() {
  const [verse, setVerse] = useState<Verse>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        setLoading(true);
        console.log('Fetching verse from API...');
        const res = await fetch('/api/verses');
        
        console.log('API response status:', res.status);
        
        if (res.ok) {
          try {
            const data = await res.json();
            console.log('Verse data received:', data);
            setVerse(data);
          } catch (jsonError) {
            console.error('Error parsing verse JSON:', jsonError);
            setError('Error parsing verse data');
          }
        } else {
          console.error('Failed to load verse, status:', res.status);
          setError(`Failed to load today's verse (${res.status})`);
          // Try to get the error message
          try {
            const errorData = await res.text();
            console.error('Error response:', errorData);
          } catch (e) {
            console.error('Could not read error response');
          }
        }
      } catch (err) {
        console.error('Error fetching verse:', err);
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchVerse();
    
    // Optional: Refresh the verse every day at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimer = setTimeout(() => {
      fetchVerse();
    }, timeUntilMidnight);
    
    return () => clearTimeout(midnightTimer);
  }, []);

  if (loading) return <div className="text-yellow-400 py-4">Loading today's verse...</div>;
  
  if (error) return <div className="text-red-400 py-4">{error}</div>;
  
  if (!verse) return <div className="text-white py-4">No verse available for today.</div>;

  return (
    <div className="text-white px-2">
      <h3 className="text-lg sm:text-xl font-bold text-yellow-400 mb-2">{verse.title}</h3>
      <p className="text-base sm:text-lg italic mb-2 break-words">"{verse.scripture}"</p>
      <p className="text-xs sm:text-sm text-gray-300">Added on {new Date(verse.createdAt).toLocaleDateString()}</p>
    </div>
  );
}