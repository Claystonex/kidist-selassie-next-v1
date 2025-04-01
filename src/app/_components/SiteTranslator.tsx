'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/app/_contexts/TranslationContext';

interface SiteTranslatorProps {
  children: React.ReactNode;
}

const SiteTranslator: React.FC<SiteTranslatorProps> = ({ children }) => {
  const { language, isTranslating } = useTranslation();
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // This effect runs when language changes
    const startTime = Date.now();
    const animationDuration = 1500; // Animation duration in ms
    
    if (isTranslating) {
      setTranslating(true);
      
      // Animate progress bar
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / animationDuration) * 100, 95);
        setProgress(newProgress);
        
        if (elapsed >= animationDuration) {
          clearInterval(interval);
        }
      }, 50);
      
      return () => clearInterval(interval);
    } else if (translating) {
      // When translation is complete
      setProgress(100);
      const timeout = setTimeout(() => {
        setTranslating(false);
        setProgress(0);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [isTranslating, translating, language]);

  // Add mutation observer to automatically translate dynamically added content
  useEffect(() => {
    // This is a placeholder for future implementation of dynamic content translation
    // It would observe DOM changes and translate new content as it's added
    
    // For now, we can add a data attribute to the body to indicate current language
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-language', language);
      
      // Set dir attribute for RTL languages if needed
      // Amharic is a left-to-right language, but if you add Arabic or Hebrew in the future, you'll need this
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [language]);

  return (
    <>
      {translating && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div 
            className="h-1 bg-[#ffb43c] transition-all duration-300 ease-in-out" 
            style={{ width: `${progress}%` }}
          />
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-[#086c47] text-white text-xs px-2 py-1 rounded-md opacity-80">
            Translating to {language === 'en' ? 'English' : language === 'am' ? 'Amharic' : language === 'fr' ? 'French' : 'Spanish'}...
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default SiteTranslator;
