'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/app/_contexts/TranslationContext';
import { motion, AnimatePresence } from 'framer-motion';

type LanguageToggleProps = {
  onLanguageChange?: () => void;
};

type LanguageInfo = {
  name: string; 
  native: string;
  flag: string;
};

const languages: Record<string, LanguageInfo> = {
  en: { name: 'English', native: 'English', flag: '🇺🇸' },
  am: { name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
  fr: { name: 'French', native: 'Français', flag: '🇫🇷' },
  es: { name: 'Spanish', native: 'Español', flag: '🇪🇸' }
};

const LanguageToggle: React.FC<LanguageToggleProps> = ({ onLanguageChange }) => {
  const { language, setLanguage, isTranslating } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleLanguageChange = (lang: 'en' | 'am' | 'fr' | 'es') => {
    setLanguage(lang);
    setIsOpen(false);
    
    // Show the hint tooltip for 3 seconds
    setShowHint(true);
    setTimeout(() => setShowHint(false), 3000);
    
    // Force a refresh if user clicks same language (helpful when translations don't appear)
    if (lang === language) {
      // Create a small delay and then reload translation
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Language hint tooltip */}
      <AnimatePresence>
        {showHint && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-[45px] z-50 bg-yellow-400 text-black rounded-md px-3 py-1 text-sm shadow-md whitespace-nowrap"
          >
            If translation issues occur, click language again to refresh
            <div className="absolute top-[-6px] right-3 h-3 w-3 bg-yellow-400 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <button
        onClick={toggleDropdown}
        disabled={isTranslating}
        className="flex items-center space-x-2 px-3 py-2 bg-[#086c47] hover:bg-[#075a3c] text-white rounded-md transition-all duration-200 disabled:opacity-50 border border-[#097e55]"
        title="Change language"
      >
        <span className="mr-1">{languages[language as keyof typeof languages]?.flag || '🌐'}</span>
        <span className="text-sm font-medium">
          {isTranslating ? 'Translating...' : languages[language as keyof typeof languages]?.native || language}
        </span>
        <svg 
          className={`w-4 h-4 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {Object.entries(languages).map(([code, info]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code as any)}
                className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${language === code ? 'bg-gray-50 font-medium' : ''}`}
              >
                <span className="mr-2">{info.flag}</span>
                <span>{info.name}</span>
                <div className="ml-auto flex items-center">
                  {language === code && (
                    <svg className="w-4 h-4 text-[#086c47]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
