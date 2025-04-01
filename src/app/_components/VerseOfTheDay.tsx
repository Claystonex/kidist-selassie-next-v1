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
        const res = await fetch('/api/verses');
        
        if (res.ok) {
          const data = await res.json();
          setVerse(data);
        } else {
          setError('Failed to load today\'s verse');
        }
      } catch (err) {
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

  if (loading) return <div className={styles.verseContainer || 'verseContainer'}>Loading today's verse...</div>;
  
  if (error) return <div className={styles.verseContainer || 'verseContainer'}>{error}</div>;
  
  if (!verse) return <div className={styles.verseContainer || 'verseContainer'}>No verse available for today.</div>;

  return (
    <div className={styles.verseContainer || 'verseContainer'}>
      <h2 className={styles.verseTitle || 'verseTitle'}>Verse of the Day</h2>
      <h3 className={styles.verseReference || 'verseReference'}>{verse.title}</h3>
      <p className={styles.verseText || 'verseText'}>{verse.scripture}</p>
    </div>
  );
}