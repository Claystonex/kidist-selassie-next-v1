// components/Comment.tsx
'use client';

import { useState } from 'react';

interface CommentProps {
  comment: {
    id: string | number;
    text: string;
  };
}

export default function Comment({ comment }: CommentProps) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>('am'); // Default to Amharic

  const handleTranslate = async () => {
    setIsTranslating(true);
    setError(null);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: comment.text, targetLanguage }),
      });

      const data: { translation?: string; error?: string } = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setTranslation(data.translation || '');
      }
    } catch (err) {
      setError('An error occurred during translation.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <p>{comment.text}</p>
      {translation && (
        <p style={{ color: 'gray', fontStyle: 'italic' }}>
          Translated: {translation}
        </p>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          style={{ marginRight: '8px' }}
        >
          <option value="am">Amharic</option>
          <option value="en">English</option>
          {/* Add more languages as needed */}
        </select>
        <button onClick={handleTranslate} disabled={isTranslating}>
          {isTranslating ? 'Translating...' : 'Translate'}
        </button>
      </div>
    </div>
  );
}