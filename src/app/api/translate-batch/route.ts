// app/api/translate-batch/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Get API key from environment variables
const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

/**
 * Batch translation API endpoint
 * Handles bulk translation of multiple text strings at once
 */

// Helper function to call Google Translate API for batch translation
async function batchTranslateText(texts: string[], targetLanguage: string): Promise<string[]> {
  // Direct call to Google Translate API v2
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: texts,
        target: targetLanguage,
        format: 'text',
      }),
    });

    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      console.error('Batch translation API error:', data.error);
      throw new Error(data.error.message || 'Batch translation failed');
    }
    
    // Return translated texts
    if (data.data && 
        data.data.translations && 
        data.data.translations.length > 0) {
      return data.data.translations.map((t: { translatedText: string }) => t.translatedText);
    }
    
    throw new Error('Invalid response format from translation API');
  } catch (error) {
    console.error('Batch translation API error:', error);
    // Return original texts as fallback
    return texts;
  }
}

// Fallback to using individual translations if batch API fails
async function fallbackIndividualTranslations(texts: string[], targetLanguage: string): Promise<string[]> {
  const translationPromises = texts.map(text => 
    fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, targetLanguage }),
    })
    .then(res => res.json())
    .then(data => data.translation || text)
    .catch(() => text)
  );
  
  return Promise.all(translationPromises);
}

export async function POST(request: NextRequest) {
  try {
    const { texts, targetLanguage } = await request.json();
    
    if (!texts || !Array.isArray(texts) || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing texts array or targetLanguage' },
        { status: 400 }
      );
    }

    // Skip empty array
    if (texts.length === 0) {
      return NextResponse.json({ translations: [] });
    }

    // Filter out empty strings
    const validTexts = texts.filter(text => text && text.trim() !== '');
    
    if (validTexts.length === 0) {
      return NextResponse.json({ translations: texts });
    }
    
    // Try batch translation first
    try {
      if (apiKey) {
        console.log(`Batch translating ${validTexts.length} texts to ${targetLanguage}`);
        const translations = await batchTranslateText(validTexts, targetLanguage);
        
        // Map back to original array positions
        const resultTranslations = texts.map(text => {
          if (!text || text.trim() === '') return text;
          const index = validTexts.indexOf(text);
          return index >= 0 ? translations[index] : text;
        });
        
        return NextResponse.json({ translations: resultTranslations });
      }
    } catch (error) {
      console.error('Batch translation failed, falling back to individual translations', error);
    }
    
    // Fallback to individual translations
    console.log('Using individual translations as fallback');
    const fallbackTranslations = await fallbackIndividualTranslations(validTexts, targetLanguage);
    
    // Map back to original array positions
    const resultTranslations = texts.map(text => {
      if (!text || text.trim() === '') return text;
      const index = validTexts.indexOf(text);
      return index >= 0 ? fallbackTranslations[index] : text;
    });
    
    return NextResponse.json({ translations: resultTranslations });
    
  } catch (error) {
    console.error('Batch translation API handler error:', error);
    return NextResponse.json(
      { error: 'Translation service error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
