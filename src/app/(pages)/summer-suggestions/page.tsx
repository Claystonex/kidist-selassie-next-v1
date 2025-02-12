'use client';

import { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface Suggestion {
  id: string;
  content: string;
  createdAt: Date;
}

export default function SummerSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/summer-suggestions');
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestion.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/summer-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newSuggestion }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions([...suggestions, data]);
        setNewSuggestion('');
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/summer-suggestions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuggestions(suggestions.filter(suggestion => suggestion.id !== id));
      }
    } catch (error) {
      console.error('Error deleting suggestion:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Summer Activity Suggestions</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={newSuggestion}
            onChange={(e) => setNewSuggestion(e.target.value)}
            placeholder="Enter your suggestion for a summer activity..."
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center"
          >
            <div>
              <p className="text-lg">{suggestion.content}</p>
              <p className="text-sm text-gray-500">
                {new Date(suggestion.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(suggestion.id)}
              className="p-2 text-red-500 hover:text-red-700 transition-colors"
              aria-label="Delete suggestion"
            >
              <FaTrash />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
