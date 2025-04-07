// File: /app/(pages)/admin/verses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/Admin.module.css';

export default function VerseAdmin() {
  const [verses, setVerses] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [scripture, setScripture] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPassword, setAuthPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchVerses();
    }
  }, [isAuthenticated]);

  const fetchVerses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/verses?all=true');
      if (response.ok) {
        const data = await response.json();
        setVerses(data);
      } else {
        setError('Failed to load verses');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setMessage('');
    setError('');
    
    if (!title || !scripture || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Submitting verse:', { title, hasPassword: !!password });
      
      const response = await fetch('/api/verses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, scripture, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Verse added successfully!');
        setTitle('');
        setScripture('');
        fetchVerses();
      } else {
        console.error('Error response:', response.status, data);
        setError(data.error || `Failed to add verse (Status: ${response.status})`);
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Error connecting to server. Please check your network connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!password) {
      setError('Password is required to delete a verse');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this verse?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/verses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, password }),
      });
      
      if (response.ok) {
        setMessage('Verse deleted successfully!');
        fetchVerses();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete verse');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setMessage('');
    setError('');
    
    if (!authPassword) {
      setError('Please enter the admin password');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Attempting authentication...');
      
      // We'll use the same password check as the API
      const response = await fetch('/api/verses/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: authPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('Authentication successful');
        setIsAuthenticated(true);
        setPassword(authPassword); // Set the main password field to reuse for other operations
        setError(''); // Clear any errors
      } else {
        console.error('Authentication failed:', response.status, data);
        setError(data.error || `Authentication failed (Status: ${response.status})`);
        
        // Show hint if it seems to be a special character issue
        if (authPassword.includes('%')) {
          setError((prev) => prev + '. Note: Special characters like % may cause issues.');
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Error connecting to server. Please check your network connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Bible Verse Admin</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleAuthentication} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="authPassword">Enter Admin Password:</label>
            <input
              type="password"
              id="authPassword"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bible Verse Admin</h1>
      
      {message && <div className={styles.success}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Verse Reference (e.g., John 4:16-21):</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="scripture">Scripture Text:</label>
          <textarea
            id="scripture"
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
            rows={5}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="password">Admin Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add New Verse'}
        </button>
      </form>
      
      <h2 className={styles.subtitle}>Manage Verses</h2>
      
      {loading && <p>Loading...</p>}
      
      <div className={styles.versesList}>
        {verses.length === 0 ? (
          <p>No verses added yet.</p>
        ) : (
          verses.map((verse) => (
            <div key={verse.id} className={styles.verseItem}>
              <h3>{verse.title}</h3>
              <p>{verse.scripture}</p>
              <p className={styles.date}>
                Added on: {new Date(verse.createdAt).toLocaleDateString()}
              </p>
              <button
                onClick={() => handleDelete(verse.id)}
                className={styles.deleteButton}
                disabled={loading}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}