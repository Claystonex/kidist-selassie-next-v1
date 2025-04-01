'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/app/_contexts/TranslationContext';
import TranslatableText from './TranslatableText';

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  // Add other fields as needed
}

interface TranslatableCommentProps {
  comment: Comment;
}

const TranslatableComment: React.FC<TranslatableCommentProps> = ({ comment }) => {
  const { translateText, language, setLanguage } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatedContent, setTranslatedContent] = useState('');

  const handleTranslate = async () => {
    setIsTranslating(true);
    // Store the current language
    const currentLanguage = language;
    try {
      // Translate to opposite of current language
      const targetLang = language === 'en' ? 'am' : 'en';
      
      // Temporarily change the language for translation
      setLanguage(targetLang);
      
      // Get the translation with the new language context
      const translated = await translateText(comment.content);
      
      // Store the result
      setTranslatedContent(translated);
      setShowTranslation(true);
      
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      // Always restore the original language when done or on error
      setLanguage(currentLanguage);
      setIsTranslating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-[#086c47]">{comment.author}</h4>
          <p className="text-xs text-gray-500">{comment.date}</p>
        </div>
        
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className="text-xs bg-[#086c47] text-white px-2 py-1 rounded-md hover:bg-[#064e33] transition-colors disabled:opacity-50"
        >
          {isTranslating ? 'Translating...' : 
            language === 'en' ? 'Translate to አማርኛ' : 'Translate to English'}
        </button>
      </div>
      
      <div className="mt-2 whitespace-pre-wrap">
        {/* Original content - automatically translated if site language changes */}
        <TranslatableText as="p">{comment.content}</TranslatableText>
        
        {/* Manually translated content - shown on demand */}
        {showTranslation && (
          <div className="mt-3 p-3 bg-gray-50 border-l-4 border-[#086c47] rounded">
            <p className="text-xs text-gray-500 mb-1">
              {language === 'en' ? 'አማርኛ Translation:' : 'English Translation:'}
            </p>
            <p>{translatedContent}</p>
          </div>
        )}
      </div>
      
      <div className="mt-3 flex text-xs text-gray-500 space-x-4">
        <button className="hover:text-[#086c47]">Reply</button>
        <button className="hover:text-[#086c47]">Like</button>
        <button className="hover:text-[#086c47]">Share</button>
      </div>
    </div>
  );
};

export default TranslatableComment;
