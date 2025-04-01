'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/app/_contexts/TranslationContext';

interface TranslatableTextProps {
  children: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  showOriginal?: boolean;
}

const TranslatableText: React.FC<TranslatableTextProps> = ({
  children,
  className = '',
  as: Component = 'span',
  showOriginal = false,
}) => {
  const { language, translateText } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string>(children);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [originalText] = useState<string>(children);

  useEffect(() => {
    let isMounted = true;
    
    // Skip translation if content is empty
    if (!originalText.trim()) {
      setTranslatedText(originalText);
      return () => { isMounted = false; };
    }
    
    const translate = async () => {
      // If we're using English and the content is already in English, no need to translate
      if (language === 'en' && /^[\x00-\x7F\s]*$/.test(originalText)) {
        setTranslatedText(originalText);
        return;
      }
      
      setIsLoading(true);
      try {
        const translated = await translateText(originalText);
        if (isMounted) {
          setTranslatedText(translated);
        }
      } catch (error) {
        console.error('Translation error:', error);
        if (isMounted) {
          setTranslatedText(originalText); // Fallback to original
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    translate();

    return () => {
      isMounted = false;
    };
  }, [language, originalText, translateText]);

  return (
    <Component className={`${className} ${isLoading ? 'opacity-70' : ''}`}>
      {translatedText}
      {showOriginal && language !== 'en' && (
        <span className="text-gray-500 text-sm block">
          ({originalText})
        </span>
      )}
    </Component>
  );
};

export default TranslatableText;
