'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/app/_contexts/TranslationContext';

// Import the Language type directly from TranslationContext to keep it in sync
import type { Language } from '@/app/_contexts/TranslationContext';

type LanguageInfo = {
  name: string;
  native?: string;
  flag: string;
};

const languages: Record<Language, LanguageInfo> = {
  en: { name: 'English', flag: '🇺🇸' },
  am: { name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
  fr: { name: 'French', native: 'Français', flag: '🇫🇷' },
  es: { name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  ru: { name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  zh: { name: 'Chinese', native: '中文', flag: '🇨🇳' },
  sv: { name: 'Swedish', native: 'Svenska', flag: '🇸🇪' },
  de: { name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  af: { name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦' },
  it: { name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Portuguese', native: 'Português', flag: '🇵🇹' }
};

const CommentTranslator: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const { translateText, language, setLanguage } = useTranslation();

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await translateText(inputText);
      setTranslatedText(result);
    } catch (err) {
      setError('Translation failed. Please try again.');
      console.error('Translation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
  };

  const selectLanguage = (code: Language) => {
    setLanguage(code);
    setShowLanguageDropdown(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 mb-4 max-w-md mx-auto">
      <h3 className="text-base font-semibold mb-2">Comment Translator</h3>
      <p className="text-xs text-gray-600 mb-3">
        Paste a comment from the forum to translate it using the currently selected language.
      </p>

      <div className="space-y-3">
        <div>
          <label htmlFor="targetLanguage" className="block text-xs font-medium text-gray-700 mb-1">
            Target Language
          </label>
          <div className="relative">
            <button 
              type="button"
              onClick={toggleLanguageDropdown}
              className="flex items-center justify-between w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#086c47] bg-white hover:bg-gray-50"
            >
              <span className="flex items-center">
                <span className="mr-2">{languages[language]?.flag || '🌐'}</span>
                {languages[language]?.native || languages[language]?.name || language}
              </span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showLanguageDropdown && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg">
                {Object.entries(languages).map(([code, lang]) => (
                  <button
                    key={code}
                    onClick={() => selectLanguage(code as Language)}
                    className={`flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-100 ${language === code ? 'bg-gray-50' : ''}`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    <span>{lang.native ?? lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="inputText" className="block text-xs font-medium text-gray-700 mb-1">
            Text to Translate
          </label>
          <textarea
            id="inputText"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste text here..."
            rows={3}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#086c47] focus:border-transparent"
          ></textarea>
        </div>

        <button
          onClick={handleTranslate}
          disabled={isLoading || !inputText.trim()}
          className="w-full py-1.5 px-3 bg-[#086c47] text-white text-sm rounded-md hover:bg-[#075a3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Translating...' : 'Translate'}
        </button>

        {error && <p className="text-red-600 text-xs">{error}</p>}

        {translatedText && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Translation</label>
            <div className="p-2 text-sm bg-gray-50 rounded-md border border-gray-200">
              <p className="whitespace-pre-wrap">{translatedText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentTranslator;
