'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Languages supported
type Language = 'en' | 'am' | 'fr' | 'es'; // English, Amharic, French, or Spanish

// Common translations that we can use immediately without API calls
const COMMON_TRANSLATIONS: Record<string, Record<Language, string>> = {
  // Navigation
  'Services': {
    en: 'Services',
    am: 'አገልግሎቶች',
    fr: 'Services',
    es: 'Servicios'
  },
  'Questions': {
    en: 'Questions',
    am: 'ጥያቄዎች',
    fr: 'Questions',
    es: 'Preguntas'
  },
  'Mentorship': {
    en: 'Mentorship',
    am: 'አመራር',
    fr: 'Mentorat',
    es: 'Mentoría'
  },
  'Bootcamps': {
    en: 'Bootcamps',
    am: 'ቡትካምፖች',
    fr: 'Bootcamps',
    es: 'Bootcamps'
  },
  'Interact': {
    en: 'Interact',
    am: 'መስተጋብር',
    fr: 'Interagir',
    es: 'Interactuar'
  },
  'Forum': {
    en: 'Forum',
    am: 'መድረክ',
    fr: 'Forum',
    es: 'Foro'
  },
  'Prayer Requests': {
    en: 'Prayer Requests',
    am: 'የጸሎት ጥያቄዎች',
    fr: 'Demandes de prière',
    es: 'Peticiones de oración'
  },
  'Miracles': {
    en: 'Miracles',
    am: 'ተዓምራት',
    fr: 'Miracles',
    es: 'Milagros'
  },
  'Gallery': {
    en: 'Gallery',
    am: 'ጋለሪ',
    fr: 'Galerie',
    es: 'Galería'
  },
  'Bible Tracker': {
    en: 'Bible Tracker',
    am: 'የመጽሐፍ ቅዱስ መከታተያ',
    fr: 'Suivi de la Bible',
    es: 'Rastreador de la Biblia'
  },
  'Teachings': {
    en: 'Teachings',
    am: 'ትምህርቶች',
    fr: 'Enseignements',
    es: 'Enseñanzas'
  },
  'Donate': {
    en: 'Donate',
    am: 'ለመለገስ',
    fr: 'Faire un don',
    es: 'Donar'
  },
  'Join': {
    en: 'Join',
    am: 'ተቀላቀል',
    fr: 'Rejoindre',
    es: 'Unirse'
  },
  // Common headings and phrases
  'Kidist Selassie Youth International Network': {
    en: 'Kidist Selassie Youth International Network',
    am: 'ቅድስት ሰላሴ ዓለም አቀፍ የወጣቶች ኔትወርክ',
    fr: 'Réseau international de la jeunesse Kidist Selassie',
    es: 'Red Internacional de Jóvenes Kidist Selassie'
  },
  'Follow Us': {
    en: 'Follow Us',
    am: 'ተከተሉን',
    fr: 'Suivez-nous',
    es: 'Síguenos'
  },
  'Bible Teachings': {
    en: 'Bible Teachings',
    am: 'የመጽሐፍ ቅዱስ ትምህርቶች',
    fr: 'Enseignements bibliques',
    es: 'Enseñanzas bíblicas'
  },
  'Submit Prayer Request': {
    en: 'Submit Prayer Request',
    am: 'የጸሎት ጥያቄ አስገባ',
    fr: 'Soumettre une demande de prière',
    es: 'Enviar petición de oración'
  },
  'Prayer Title': {
    en: 'Prayer Title',
    am: 'የጸሎት ርዕስ',
    fr: 'Titre de la prière',
    es: 'Título de la oración'
  },
  'Prayer Description': {
    en: 'Prayer Description',
    am: 'የጸሎት መግለጫ',
    fr: 'Description de la prière',
    es: 'Descripción de la oración'
  },
  'Private Prayer': {
    en: 'Private Prayer',
    am: 'የግል ጸሎት',
    fr: 'Prière privée',
    es: 'Oración privada'
  },
  'Public Prayer': {
    en: 'Public Prayer',
    am: 'የህዝብ ጸሎት',
    fr: 'Prière publique',
    es: 'Oración pública'
  },
};

// Interface for the translation context
interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (text: string) => string;
  translateText: (text: string) => Promise<string>;
  translateBatch: (texts: string[]) => Promise<string[]>;
  isTranslating: boolean;
  translationError: string | null;
  reloadPage: () => void;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

interface TranslationProviderProps {
  children: ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, Record<Language, string>>>(COMMON_TRANSLATIONS);
  const translationCache = useRef(new Map<string, string>());
  const pathname = usePathname();
  const router = useRouter();
  
  // Load language preference and cached translations from localStorage on initial render
  useEffect(() => {
    try {
      // Load language preference
      const savedLanguage = localStorage.getItem('preferred-language');
      if (savedLanguage === 'en' || savedLanguage === 'am' || savedLanguage === 'fr' || savedLanguage === 'es') {
        setLanguage(savedLanguage as Language);
      }
      
      // Load cached translations if available
      const savedTranslations = localStorage.getItem('translation-cache');
      if (savedTranslations) {
        try {
          const parsedTranslations = JSON.parse(savedTranslations);
          setTranslations(prev => ({ ...prev, ...parsedTranslations }));
          
          // Also populate the memory cache for faster access
          Object.entries(parsedTranslations).forEach(([text, langMap]) => {
            if (langMap && typeof langMap === 'object') {
              Object.entries(langMap as Record<Language, string>).forEach(([lang, translation]) => {
                if (translation) {
                  translationCache.current.set(`${text}:${lang}`, translation);
                }
              });
            }
          });
          
          console.log('Loaded cached translations from localStorage');
        } catch (parseError) {
          console.error('Error parsing saved translations:', parseError);
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('preferred-language', language);
      document.documentElement.setAttribute('lang', language);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  }, [language]);
  
  // Simple reload page function
  const reloadPage = () => {
    try {
      window.location.reload();
    } catch (error) {
      console.error('Error reloading page:', error);
    }
  };

  // Translate a single text string - synchronous, uses only cached translations
  const translate = (text: string): string => {
    // Return original text if we're in English mode or if text is empty
    if (language === 'en' || !text || text.trim() === '') {
      return text;
    }

    // Check memory cache first (fastest)
    const cacheKey = `${text}:${language}`;
    if (translationCache.current.has(cacheKey)) {
      return translationCache.current.get(cacheKey) || text;
    }

    // Check persistent cache in translations state
    if (translations[text] && translations[text][language]) {
      // Add to memory cache for faster future access
      translationCache.current.set(cacheKey, translations[text][language]);
      return translations[text][language];
    }

    // If not cached, return original text for now
    return text;
  };

  // Translate multiple texts at once - optimized for bulk translation with proper caching
  const translateBatch = async (texts: string[]): Promise<string[]> => {
    if (language === 'en') return texts;
    if (texts.length === 0) return [];
    
    setTranslationError(null);
    
    // First check for all texts in cache
    const results: string[] = [];
    const textsToTranslate: string[] = [];
    const indices: number[] = [];
    
    // Check which texts need translation vs which are already cached
    texts.forEach((text, index) => {
      if (!text || text.trim() === '') {
        results[index] = text; // Keep empty texts as is
        return;
      }
      
      // Check memory cache first
      const cacheKey = `${text}:${language}`;
      if (translationCache.current.has(cacheKey)) {
        results[index] = translationCache.current.get(cacheKey) || text;
        return;
      }
      
      // Check persistent cache
      if (translations[text]?.[language]) {
        const translated = translations[text][language];
        results[index] = translated;
        // Also add to memory cache
        translationCache.current.set(cacheKey, translated);
        return;
      }
      
      // Text needs translation
      textsToTranslate.push(text);
      indices.push(index);
    });
    
    // If everything was cached, return immediately
    if (textsToTranslate.length === 0) {
      return results;
    }
    
    // Log how many texts need translation vs are cached
    console.log(`Translating ${textsToTranslate.length} texts, ${texts.length - textsToTranslate.length} from cache`);
    
    try {
      setIsTranslating(true);
      
      // Perform batch translation request
      const response = await fetch('/api/translate-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          texts: textsToTranslate, 
          targetLanguage: language
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const status = response.status;
        throw new Error(`HTTP error ${status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Store translations in both caches
      const newTranslations = { ...translations };
      
      textsToTranslate.forEach((text, i) => {
        if (!text) return;
          
        const translatedText = data.translations?.[i] || text;
        const originalIndex = indices[i];
        
        // Only process if we have a valid index
        if (originalIndex !== undefined) {
          // Update results array
          results[originalIndex] = translatedText;
          
          // Add to memory cache
          translationCache.current.set(`${text}:${language}`, translatedText);
          
          // Add to persistent cache
          if (!newTranslations[text]) {
            newTranslations[text] = { en: text, am: '', fr: '', es: '' };
          }
          newTranslations[text][language] = translatedText;
        }
      });
      
      // Update persistent cache
      setTranslations(newTranslations);
      
      // Try to persist to localStorage if available
      try {
        localStorage.setItem('translation-cache', JSON.stringify(newTranslations));
      } catch (err) {
        console.warn('Could not save translations to localStorage:', err);
      }
      
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown translation error';
      console.error('Translation error:', errorMessage);
      setTranslationError(errorMessage);
      
      // Fall back to original texts for any untranslated items
      textsToTranslate.forEach((text, i) => {
        const originalIndex = indices[i];
        if (originalIndex !== undefined && text) {
          results[originalIndex] = text;
        }
      });
      
      return results;
    } finally {
      setIsTranslating(false);
    }
  };

  // Directly translate a single piece of text - with comprehensive caching and error handling
  const translateText = async (text: string): Promise<string> => {
    if (language === 'en' || !text || text.trim() === '') {
      return text;
    }
    
    setTranslationError(null);

    // Check memory cache first (fastest)
    const cacheKey = `${text}:${language}`;
    if (translationCache.current.has(cacheKey)) {
      return translationCache.current.get(cacheKey) || text;
    }

    // Check persistent cache in state
    if (translations[text] && translations[text][language]) {
      const translated = translations[text][language];
      // Add to memory cache too
      translationCache.current.set(cacheKey, translated);
      return translated;
    }

    // Need to fetch translation
    try {
      setIsTranslating(true);
      const translatedText = await fetchTranslation(text, language);
      
      // Cache the result in both caches
      translationCache.current.set(cacheKey, translatedText);
      
      setTranslations(prev => {
        const newTranslations = { ...prev };
        if (!newTranslations[text]) {
          newTranslations[text] = { en: text, am: '', fr: '', es: '' };
        }
        newTranslations[text][language] = translatedText;
        
        // Try to persist to localStorage
        try {
          localStorage.setItem('translation-cache', JSON.stringify(newTranslations));
        } catch (err) {
          console.warn('Could not save translations to localStorage:', err);
        }
        
        return newTranslations;
      });
      
      return translatedText;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown translation error';
      console.error('Translation error:', errorMessage);
      setTranslationError(errorMessage);
      return text; // Fall back to original text
    } finally {
      setIsTranslating(false);
    }
  };

  // Fetch translation from API - with improved error handling
  const fetchTranslation = async (text: string, targetLang: Language): Promise<string> => {
    if (targetLang === 'en') return text;
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text, 
          targetLanguage: targetLang
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const status = response.status;
        throw new Error(`HTTP error ${status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.translation || text;
    } catch (error) {
      console.error('Translation API request failed:', error);
      throw error; // Re-throw to handle at higher level
    }
  };
  
  return (
    <TranslationContext.Provider
      value={{
        language,
        setLanguage,
        translate,
        translateText,
        translateBatch,
        isTranslating,
        translationError,
        reloadPage
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

// Hook to use translation in components
export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

// TranslatableText component - the primary way to mark text for translation
export default function TranslatableText({ children }: { children: React.ReactNode }) {
  const { translate } = useTranslation();
  
  // Simple case: string children
  if (typeof children === 'string') {
    return <>{translate(children)}</>;
  }
  
  // Complex case: we'll just return the children as is
  // This handles cases where children are React elements with their own translations
  return <>{children}</>;
}
