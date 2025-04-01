// app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Get API key from environment variables
const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

// Debug log to check API key (only visible in server logs)
console.log('Google Translate API key available:', !!apiKey);

// Mock translations for testing purposes
const mockTranslations = {
  'am': {
    // English to Amharic
    'What to Expect from Kidist Selassie Youth International Program': 'ከቅድስት ሰላሴ ዓለም አቀፍ የወጣቶች ፕሮግራም የሚጠበቀው',
    '*Our Mission and Goals*': '*የእኛ ተልዕኮ እና ግቦች*',
    'Verse of the Day:': 'የዕለቱ ጥቅስ፡',
    'A Verse a day keeps the devil away.': 'በየቀኑ አንድ ጥቅስ ዲያብሎስን ያርቃል።',
    'Follow Us': 'ተከተሉን',
    'Kidist Selassie Youth International Network': 'ቅድስት ሰላሴ ዓለም አቀፍ የወጣቶች ኔትወርክ',
    'A community of faith, online networking, and support. Join us in sharing prayers, finding mentorship, and experiencing miracles together.': 'የእምነት፣ የመስመር ላይ አውታረ መረብ እና የድጋፍ ማህበረሰብ። ጸሎትን በመጋራት፣ አመራርን በማግኘት እና ተዓምራትን አብረን በመመልከት ይቀላቀሉን።',
    'Mentorship': 'አመራር/አማካሪ',
    'Connect with experienced mentors in faith and technology.': 'በእምነት እና በቴክኖሎጂ ልምድ ካላቸው አማካሪዎች ጋር ይገናኙ።',
    'Prayer Requests': 'የጸሎት ጥያቄዎች',
    'Share your prayers and pray for others in our global community.': 'ጸሎትዎን ያጋሩ እና በዓለም አቀፍ ማህበረሰባችን ውስጥ ላሉ ሌሎች ይጸልዩ።',
    'Miracles': 'ተዓምራት',
    'Witness and share stories of God\'s work in our community.': 'በማህበረሰባችን ውስጥ የእግዚአብሔርን ሥራ ተመልከቱ እና ታሪኮችን አጋሩ።',
    'Post Your Funny Audio': 'አስቂኝ ኦዲዮዎን ለጥፍ',
    'Share your short (clean) jokes and laugh with our community.': 'አጫጭር (ንጹህ) ቀልዶችዎን ያጋሩ እና ከማህበረሰባችን ጋር ይስቁ።',
    'Q&A': 'ጥያቄ እና መልስ',
    'Ask questions and get answers from our community.': 'ጥያቄዎችን ይጠይቁ እና ከማህበረሰባችን መልሶችን ያግኙ።',
    'Feedback/Comments': 'ግብረመልስ/አስተያየቶች',
    'Share your feedback and comments about the website.': 'ስለ ድህረ ገጹ ግብረመልስዎን እና አስተያየቶችዎን ያጋሩ።',
    // Navigation items
    'Services': 'አገልግሎቶች',
    'Interact': 'መስተጋብር',
    'Gallery': 'ጋለሪ',
    'Bible Tracker': 'የመጽሐፍ ቅዱስ መከታተያ',
    'Teachings': 'ትምህርቶች',
    'Donate': 'ለመለገስ',
    'Join': 'ተቀላቀል',
    'Questions': 'ጥያቄዎች',
    'Bootcamps': 'ቡትካምፖች',
    'Forum': 'መድረክ'
  },
  'fr': {
    // English to French simple translations
    'What to Expect from Kidist Selassie Youth International Program': 'Ce que vous pouvez attendre du programme international de jeunesse de Kidist Selassie',
    '*Our Mission and Goals*': '*Notre mission et nos objectifs*',
    'Verse of the Day:': 'Verset du jour:',
    'A Verse a day keeps the devil away.': 'Un verset par jour éloigne le diable.',
    'Follow Us': 'Suivez-nous',
    'Kidist Selassie Youth International Network': 'Réseau International de Jeunesse Kidist Selassie',
    'A community of faith, online networking, and support. Join us in sharing prayers, finding mentorship, and experiencing miracles together.': 'Une communauté de foi, de réseautage en ligne et de soutien. Rejoignez-nous pour partager des prières, trouver du mentorat et vivre des miracles ensemble.',
    'Mentorship': 'Mentorat',
    'Connect with experienced mentors in faith and technology.': 'Connectez-vous avec des mentors expérimentés dans la foi et la technologie.',
    'Prayer Requests': 'Demandes de prière',
    'Share your prayers and pray for others in our global community.': 'Partagez vos prières et priez pour les autres dans notre communauté mondiale.',
    'Miracles': 'Miracles',
    'Witness and share stories of God\'s work in our community.': 'Témoignez et partagez des histoires de l\'œuvre de Dieu dans notre communauté.',
    'Post Your Funny Audio': 'Publiez votre audio amusant',
    'Share your short (clean) jokes and laugh with our community.': 'Partagez vos blagues courtes (propres) et riez avec notre communauté.',
    'Q&A': 'Questions-Réponses',
    'Ask questions and get answers from our community.': 'Posez des questions et obtenez des réponses de notre communauté.',
    'Feedback/Comments': 'Commentaires',
    'Share your feedback and comments about the website.': 'Partagez vos commentaires sur le site web.',
    // Navigation items
    'Services': 'Services',
    'Interact': 'Interagir',
    'Gallery': 'Galerie',
    'Bible Tracker': 'Suivi Biblique',
    'Teachings': 'Enseignements',
    'Donate': 'Faire un don',
    'Join': 'Rejoindre',
    'Questions': 'Questions',
    'Bootcamps': 'Séminaires',
    'Forum': 'Forum'
  },
  'es': {
    // English to Spanish simple translations
    'What to Expect from Kidist Selassie Youth International Program': 'Qué esperar del Programa Internacional de Jóvenes de Kidist Selassie',
    '*Our Mission and Goals*': '*Nuestra Misión y Objetivos*',
    'Verse of the Day:': 'Versículo del día:',
    'A Verse a day keeps the devil away.': 'Un versículo al día mantiene alejado al diablo.',
    'Follow Us': 'Síguenos',
    'Kidist Selassie Youth International Network': 'Red Internacional de Jóvenes Kidist Selassie',
    'A community of faith, online networking, and support. Join us in sharing prayers, finding mentorship, and experiencing miracles together.': 'Una comunidad de fe, redes en línea y apoyo. Únase a nosotros para compartir oraciones, encontrar mentoría y experimentar milagros juntos.',
    'Mentorship': 'Mentoría',
    'Connect with experienced mentors in faith and technology.': 'Conéctese con mentores experimentados en fe y tecnología.',
    'Prayer Requests': 'Peticiones de oración',
    'Share your prayers and pray for others in our global community.': 'Comparta sus oraciones y ore por otros en nuestra comunidad global.',
    'Miracles': 'Milagros',
    'Witness and share stories of God\'s work in our community.': 'Sea testigo y comparta historias del trabajo de Dios en nuestra comunidad.',
    'Post Your Funny Audio': 'Publica tu audio divertido',
    'Share your short (clean) jokes and laugh with our community.': 'Comparta sus chistes cortos (limpios) y ríase con nuestra comunidad.',
    'Q&A': 'Preguntas y respuestas',
    'Ask questions and get answers from our community.': 'Haga preguntas y obtenga respuestas de nuestra comunidad.',
    'Feedback/Comments': 'Comentarios',
    'Share your feedback and comments about the website.': 'Comparta sus comentarios sobre el sitio web.',
    // Navigation items
    'Services': 'Servicios',
    'Interact': 'Interactuar',
    'Gallery': 'Galería',
    'Bible Tracker': 'Seguimiento Bíblico',
    'Teachings': 'Enseñanzas',
    'Donate': 'Donar',
    'Join': 'Unirse',
    'Questions': 'Preguntas',
    'Bootcamps': 'Campamentos',
    'Forum': 'Foro'
  }
};

/**
 * Simple function to translate text using Google Translate API
 */
async function translateText(text: string, targetLanguage: string): Promise<string> {
  // If we have a valid API key, use the Google Translate API
  if (apiKey) {
    console.log(`Using Google Translate API for: "${text}" to ${targetLanguage}`);
    
    // Only fall back to mock translations if API fails
    try {
      const translation = await callGoogleTranslateAPI(text, targetLanguage);
      return translation;
    } catch (error) {
      console.error('Google Translate API error, falling back to mock:', error);
      // If API fails, fall back to mock translations (if available)
    }
  } else {
    console.log(`No API key available, checking mock translations`);
  }
  
  // Fall back to mock translations if API key is not available or API call failed
  if (targetLanguage in mockTranslations) {
    const translations = mockTranslations[targetLanguage as keyof typeof mockTranslations];
    if (text in translations) {
      console.log(`Using mock translation for: "${text}" to ${targetLanguage}`);
      return translations[text as keyof typeof translations] as string;
    }
  }
  
  // If all else fails, return original text with language tag
  console.log(`No translation available for: "${text}" to ${targetLanguage}, returning original`);
  return `[${targetLanguage}] ${text}`;
}

// Helper function to call Google Translate API
async function callGoogleTranslateAPI(text: string, targetLanguage: string): Promise<string> {
  // Direct call to Google Translate API v2 (simpler than v3)
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      target: targetLanguage,
      format: 'text',
    }),
  });

  const data = await response.json();
  
  // Check for API errors
  if (data.error) {
    console.error('Translation API error:', data.error);
    throw new Error(data.error.message || 'Translation failed');
  }
  
  // Return translated text
  if (data.data && 
      data.data.translations && 
      data.data.translations.length > 0 && 
      data.data.translations[0].translatedText) {
    return data.data.translations[0].translatedText;
  }
  
  throw new Error('Invalid response format from translation API');
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json();
    
    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing text or targetLanguage' },
        { status: 400 }
      );
    }

    // Translate the text
    const translation = await translateText(text, targetLanguage);
    
    // Return successful response
    return NextResponse.json({ translation });
  } catch (error) {
    // Log and return error
    console.error('Translation API handler error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Translation failed' 
    }, { status: 500 });
  }
}