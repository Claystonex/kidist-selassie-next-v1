'use client';

import React, { useState, useEffect } from 'react';

interface Question {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  userName: string;
}

const QuestionsPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      // If API isn't ready yet, use sample data
      setQuestions([
        {
          id: '1',
          title: 'How can I get involved in youth ministry?',
          description: 'I would like to volunteer and help with youth activities. What are the steps to get started?',
          timestamp: new Date().toISOString(),
          userName: 'Faithful Member'
        },
        {
          id: '2',
          title: 'Bible study recommendations',
          description: 'Can anyone recommend good Bible study resources for young adults who are new to the faith?',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          userName: 'New Believer'
        }
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit question');

      // Clear form
      setTitle('');
      setDescription('');

      // Refresh the questions list
      fetchQuestions();
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('Your question has been submitted. We will implement the backend soon!');
      
      // Add the question locally for now
      setQuestions(prev => [
        {
          id: Date.now().toString(),
          title,
          description,
          timestamp: new Date().toISOString(),
          userName: 'You'
        },
        ...prev
      ]);
      
      // Clear form
      setTitle('');
      setDescription('');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Question Form */}
        <div className="bg-[#086c47] rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">Ask a Question</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                Question Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full rounded-md bg-white border-transparent focus:border-yellow-500 focus:ring-0 text-black"
                placeholder="E.g., How can I get involved in youth ministry?"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Question Details
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="mt-1 block w-full rounded-md bg-white border-transparent focus:border-yellow-500 focus:ring-0 text-black"
                placeholder="Provide more details about your question..."
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Submit Question
            </button>
          </form>
        </div>

        {/* Questions Display */}
        <div className="bg-[#086c47] border border-[#c4142c] rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">Community Questions</h2>
          <div className="space-y-6">
            {questions.length > 0 ? (
              questions.map((question) => (
                <div key={question.id} className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white">{question.title}</h3>
                  <p className="text-gray-300 mt-2">{question.description}</p>
                  <div className="mt-2 text-sm text-gray-400">
                    Asked by {question.userName} on {new Date(question.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white">No questions have been asked yet. Be the first to ask!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;