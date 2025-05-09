'use client';

import React, { useState, useEffect } from 'react';
import { AudioRecorder } from '@/app/_components/AudioRecorder/AudioRecorder';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import TranslatableText from '@/app/_components/TranslatableText';

interface Book {
  id: number;
  name: string;
  slug: string;
  chapters: number;
}

export default function RecordBiblePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<number[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    // Fetch books when component mounts
    fetchBooks();
  }, []);

  useEffect(() => {
    // Generate chapters when a book is selected
    if (selectedBook) {
      const chapterArray = Array.from({ length: selectedBook.chapters }, (_, i) => i + 1);
      setChapters(chapterArray);
    } else {
      setChapters([]);
    }
    setSelectedChapter(null);
  }, [selectedBook]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bible/books');
      if (!response.ok) throw new Error('Failed to fetch Bible books');
      const data = await response.json();
      setBooks(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      setLoading(false);
    }
  };

  const handleBookSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bookId = parseInt(e.target.value);
    const book = books.find(b => b.id === bookId) || null;
    setSelectedBook(book);
  };

  const handleChapterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chapterNum = parseInt(e.target.value);
    setSelectedChapter(chapterNum);
  };

  const handleSaveRecording = async (audioBlob: Blob, duration: number) => {
    if (!selectedBook || !selectedChapter || !user) {
      setUploadError("Please select a book and chapter, and ensure you're logged in");
      return;
    }

    // Create form data with audio file and metadata
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('bookId', selectedBook.id.toString());
    formData.append('chapterNumber', selectedChapter.toString());
    formData.append('duration', duration.toString());
    formData.append('bookName', selectedBook.name);

    try {
      setUploadError('');
      const response = await fetch('/api/bible/recordings', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload recording');
      }

      setUploadSuccess(true);
      setRecording(false);
    } catch (error) {
      console.error('Error uploading recording:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload recording');
    }
  };

  const startNewRecording = () => {
    setRecording(true);
    setUploadSuccess(false);
    setUploadError('');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#064d32]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-4">
            <TranslatableText>Record Bible Reading</TranslatableText>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            <TranslatableText>
              Share your voice by recording Bible passages for others to hear. 
              Select a book and chapter, then click the record button to begin.
            </TranslatableText>
          </p>
        </div>

        <div className="bg-[#043a26] rounded-lg shadow-xl p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-4">
              <TranslatableText>Select a Passage</TranslatableText>
            </h2>
            
            {loading ? (
              <p className="text-white"><TranslatableText>Loading Bible books...</TranslatableText></p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-yellow-300 mb-2">
                    <TranslatableText>Book</TranslatableText>
                  </label>
                  <select 
                    className="w-full p-2 rounded bg-[#032a1c] text-white border border-[#0a8055]"
                    onChange={handleBookSelect}
                    value={selectedBook?.id || ''}
                  >
                    <option value="">-- <TranslatableText>Select a Book</TranslatableText> --</option>
                    {books.map(book => (
                      <option key={book.id} value={book.id}>{book.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-yellow-300 mb-2">
                    <TranslatableText>Chapter</TranslatableText>
                  </label>
                  <select 
                    className="w-full p-2 rounded bg-[#032a1c] text-white border border-[#0a8055]"
                    onChange={handleChapterSelect}
                    value={selectedChapter || ''}
                    disabled={!selectedBook}
                  >
                    <option value="">-- <TranslatableText>Select a Chapter</TranslatableText> --</option>
                    {chapters.map(chapter => (
                      <option key={chapter} value={chapter}>{chapter}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {selectedBook && selectedChapter && !recording && !uploadSuccess && (
            <div className="mt-6 text-center">
              <button
                onClick={startNewRecording}
                className="bg-[#edcf08] hover:bg-[#e6a037] text-[#064d32] font-bold py-3 px-6 rounded-lg transition-colors"
              >
                <TranslatableText>Start Recording</TranslatableText>
              </button>
              
              <div className="mt-4 p-4 bg-[#032a1c] rounded-lg">
                <h3 className="text-yellow-300 text-lg mb-2">
                  <TranslatableText>Recording Tips</TranslatableText>
                </h3>
                <ul className="text-white text-sm list-disc list-inside space-y-1">
                  <li><TranslatableText>Find a quiet place with minimal background noise</TranslatableText></li>
                  <li><TranslatableText>Speak clearly at a moderate pace</TranslatableText></li>
                  <li><TranslatableText>Position yourself about 6-8 inches from the microphone</TranslatableText></li>
                  <li><TranslatableText>Test your microphone before starting your official recording</TranslatableText></li>
                </ul>
              </div>
            </div>
          )}

          {recording && selectedBook && selectedChapter && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4 text-center">
                <span>
                  <TranslatableText>Recording</TranslatableText>{' '}
                  {selectedBook.name}{' '}
                  <TranslatableText>Chapter</TranslatableText>{' '}
                  {selectedChapter}
                </span>
              </h3>
              
              <div className="p-4 bg-[#032a1c] rounded-lg text-center mb-4">
                <p className="text-white mb-4">
                  <span>
                    <TranslatableText>Please read</TranslatableText>{' '}
                    {selectedBook.name}{' '}
                    <TranslatableText>Chapter</TranslatableText>{' '}
                    {selectedChapter.toString()}{' '}
                    <TranslatableText>clearly. You can pause and review your recording before saving.</TranslatableText>
                  </span>
                </p>
                
                <AudioRecorder 
                  onSave={handleSaveRecording} 
                  onCancel={() => setRecording(false)}
                />
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="mt-6 p-4 bg-green-800 rounded-lg text-center">
              <p className="text-white mb-4">
                <span>
                  <TranslatableText>Thank you! Your recording of</TranslatableText>{' '}
                  {selectedBook?.name || <TranslatableText>the selected book</TranslatableText>}{' '}
                  <TranslatableText>Chapter</TranslatableText>{' '}
                  {selectedChapter !== null ? selectedChapter.toString() : ''}{' '}
                  <TranslatableText>has been successfully uploaded and will be available for others to listen to.</TranslatableText>
                </span>
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={startNewRecording}
                  className="bg-[#edcf08] hover:bg-[#e6a037] text-[#064d32] font-bold py-2 px-4 rounded transition-colors"
                >
                  <TranslatableText>Record Another Chapter</TranslatableText>
                </button>
                <Link 
                  href="/bible/listen" 
                  className="bg-[#0a8055] hover:bg-[#0b9563] text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  <TranslatableText>Listen to Recordings</TranslatableText>
                </Link>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="mt-6 p-4 bg-red-800 rounded-lg text-white text-center">
              <p>{uploadError}</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link 
            href="/bible" 
            className="text-yellow-300 hover:text-yellow-100 underline transition-colors"
          >
            <TranslatableText>Return to Bible</TranslatableText>
          </Link>
        </div>
      </div>
    </div>
  );
}
