/**
 * Generate Full Ethiopian Bible Dataset
 * 
 * Creates a comprehensive JSON file with all 81 books of the Ethiopian Bible
 * including canonical, deuterocanonical, and Ethiopian Orthodox books
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Complete list of 81 Ethiopian Bible books
const ETHIOPIAN_BIBLE_BOOKS = [
  // Old Testament - Canonical (39 books)
  { name: "Genesis", slug: "genesis", chapters: 50 },
  { name: "Exodus", slug: "exodus", chapters: 40 },
  { name: "Leviticus", slug: "leviticus", chapters: 27 },
  { name: "Numbers", slug: "numbers", chapters: 36 },
  { name: "Deuteronomy", slug: "deuteronomy", chapters: 34 },
  { name: "Joshua", slug: "joshua", chapters: 24 },
  { name: "Judges", slug: "judges", chapters: 21 },
  { name: "Ruth", slug: "ruth", chapters: 4 },
  { name: "1 Samuel", slug: "1-samuel", chapters: 31 },
  { name: "2 Samuel", slug: "2-samuel", chapters: 24 },
  { name: "1 Kings", slug: "1-kings", chapters: 22 },
  { name: "2 Kings", slug: "2-kings", chapters: 25 },
  { name: "1 Chronicles", slug: "1-chronicles", chapters: 29 },
  { name: "2 Chronicles", slug: "2-chronicles", chapters: 36 },
  { name: "Ezra", slug: "ezra", chapters: 10 },
  { name: "Nehemiah", slug: "nehemiah", chapters: 13 },
  { name: "Esther", slug: "esther", chapters: 10 },
  { name: "Job", slug: "job", chapters: 42 },
  { name: "Psalms", slug: "psalms", chapters: 150 },
  { name: "Proverbs", slug: "proverbs", chapters: 31 },
  { name: "Ecclesiastes", slug: "ecclesiastes", chapters: 12 },
  { name: "Song of Solomon", slug: "song-of-solomon", chapters: 8 },
  { name: "Isaiah", slug: "isaiah", chapters: 66 },
  { name: "Jeremiah", slug: "jeremiah", chapters: 52 },
  { name: "Lamentations", slug: "lamentations", chapters: 5 },
  { name: "Ezekiel", slug: "ezekiel", chapters: 48 },
  { name: "Daniel", slug: "daniel", chapters: 12 },
  { name: "Hosea", slug: "hosea", chapters: 14 },
  { name: "Joel", slug: "joel", chapters: 3 },
  { name: "Amos", slug: "amos", chapters: 9 },
  { name: "Obadiah", slug: "obadiah", chapters: 1 },
  { name: "Jonah", slug: "jonah", chapters: 4 },
  { name: "Micah", slug: "micah", chapters: 7 },
  { name: "Nahum", slug: "nahum", chapters: 3 },
  { name: "Habakkuk", slug: "habakkuk", chapters: 3 },
  { name: "Zephaniah", slug: "zephaniah", chapters: 3 },
  { name: "Haggai", slug: "haggai", chapters: 2 },
  { name: "Zechariah", slug: "zechariah", chapters: 14 },
  { name: "Malachi", slug: "malachi", chapters: 4 },

  // Deuterocanonical Books (7 books)
  { name: "Tobit", slug: "tobit", chapters: 14 },
  { name: "Judith", slug: "judith", chapters: 16 },
  { name: "1 Maccabees", slug: "1-maccabees", chapters: 16 },
  { name: "2 Maccabees", slug: "2-maccabees", chapters: 15 },
  { name: "Wisdom of Solomon", slug: "wisdom-of-solomon", chapters: 19 },
  { name: "Sirach", slug: "sirach", chapters: 51 },
  { name: "Baruch", slug: "baruch", chapters: 6 },

  // Ethiopian Orthodox Additional Books (8 books)
  { name: "1 Enoch", slug: "1-enoch", chapters: 108 },
  { name: "Jubilees", slug: "jubilees", chapters: 50 },
  { name: "Rest of the Words of Baruch", slug: "rest-of-baruch", chapters: 4 },
  { name: "1 Esdras", slug: "1-esdras", chapters: 9 },
  { name: "2 Esdras", slug: "2-esdras", chapters: 16 },
  { name: "Prayer of Manasseh", slug: "prayer-of-manasseh", chapters: 1 },
  { name: "Psalm 151", slug: "psalm-151", chapters: 1 },
  { name: "3 Maccabees", slug: "3-maccabees", chapters: 7 },

  // New Testament (27 books)
  { name: "Matthew", slug: "matthew", chapters: 28 },
  { name: "Mark", slug: "mark", chapters: 16 },
  { name: "Luke", slug: "luke", chapters: 24 },
  { name: "John", slug: "john", chapters: 21 },
  { name: "Acts", slug: "acts", chapters: 28 },
  { name: "Romans", slug: "romans", chapters: 16 },
  { name: "1 Corinthians", slug: "1-corinthians", chapters: 16 },
  { name: "2 Corinthians", slug: "2-corinthians", chapters: 13 },
  { name: "Galatians", slug: "galatians", chapters: 6 },
  { name: "Ephesians", slug: "ephesians", chapters: 6 },
  { name: "Philippians", slug: "philippians", chapters: 4 },
  { name: "Colossians", slug: "colossians", chapters: 4 },
  { name: "1 Thessalonians", slug: "1-thessalonians", chapters: 5 },
  { name: "2 Thessalonians", slug: "2-thessalonians", chapters: 3 },
  { name: "1 Timothy", slug: "1-timothy", chapters: 6 },
  { name: "2 Timothy", slug: "2-timothy", chapters: 4 },
  { name: "Titus", slug: "titus", chapters: 3 },
  { name: "Philemon", slug: "philemon", chapters: 1 },
  { name: "Hebrews", slug: "hebrews", chapters: 13 },
  { name: "James", slug: "james", chapters: 5 },
  { name: "1 Peter", slug: "1-peter", chapters: 5 },
  { name: "2 Peter", slug: "2-peter", chapters: 3 },
  { name: "1 John", slug: "1-john", chapters: 5 },
  { name: "2 John", slug: "2-john", chapters: 1 },
  { name: "3 John", slug: "3-john", chapters: 1 },
  { name: "Jude", slug: "jude", chapters: 1 },
  { name: "Revelation", slug: "revelation", chapters: 22 }
];

// Sample verses for different types of books
const SAMPLE_VERSES = {
  genesis: {
    1: {
      1: "በመጀመሪያ እግዚአብሔር ሰማይንና ምድርን ፈጠረ። (In the beginning God created the heaven and the earth.)",
      2: "ምድርም ባዶና ጨለማ ነበረች፥ በጨለማም ላይ ጸሎት ነበረ፤ የእግዚአብሔርም መንፈስ በውኃ ላይ ሰፈፈ። (And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.)"
    }
  },
  psalms: {
    23: {
      1: "እግዚአብሔር እረኛዬ ነው፥ የሚያሳጣኝም የለም። (The LORD is my shepherd; I shall not want.)",
      2: "በመስመሌ ያሳድረኛል፥ ወደ ዐረፍት ውኃም ይወስደኛል። (He maketh me to lie down in green pastures: he leadeth me beside the still waters.)"
    }
  },
  matthew: {
    5: {
      3: "በመንፈስ ድሆች የሰማይ መንግሥት የእነርሱ ነውና ተባረኩ። (Blessed are the poor in spirit: for theirs is the kingdom of heaven.)",
      4: "ሐዘንተኞች ይጽናናሉና ተባረኩ። (Blessed are they that mourn: for they shall be comforted.)"
    }
  }
};

/**
 * Generate verse text for a book/chapter/verse
 * @param {string} bookSlug 
 * @param {number} chapterNum 
 * @param {number} verseNum 
 * @returns {string}
 */
function generateVerseText(bookSlug, chapterNum, verseNum) {
  // Check if we have specific sample verses
  const bookSamples = /** @type {any} */ (SAMPLE_VERSES)[bookSlug];
  if (bookSamples) {
    const chapterSamples = bookSamples[chapterNum];
    if (chapterSamples) {
      const verseSample = chapterSamples[verseNum];
      if (verseSample) {
        return verseSample;
      }
    }
  }
  
  // Generate placeholder bilingual verse
  const amharicPlaceholder = `${bookSlug} ${chapterNum}:${verseNum} በአማርኛ ቃል`;
  const englishPlaceholder = `${bookSlug.replace(/-/g, ' ')} ${chapterNum}:${verseNum} verse text in English`;
  
  return `${amharicPlaceholder} (${englishPlaceholder})`;
}

/**
 * Generate random verse count for a chapter (realistic ranges)
 * @param {string} bookSlug 
 * @param {number} chapterNum 
 * @returns {number}
 */
function getVerseCount(bookSlug, chapterNum) {
  // Some books have known verse counts for specific chapters
  const knownCounts = {
    'psalms': { 119: 176, 23: 6, 1: 6 }, // Psalm 119 is the longest
    'genesis': { 1: 31, 2: 25 },
    'matthew': { 5: 48, 6: 34 },
    'john': { 3: 36, 11: 57 }
  };
  
  const bookCounts = /** @type {any} */ (knownCounts)[bookSlug];
  if (bookCounts) {
    const chapterCount = bookCounts[chapterNum];
    if (chapterCount) {
      return chapterCount;
    }
  }
  
  // Generate realistic verse counts based on book type
  if (bookSlug === 'psalms') {
    return Math.floor(Math.random() * 30) + 5; // 5-35 verses
  } else if (['genesis', 'exodus', 'numbers', 'deuteronomy'].includes(bookSlug)) {
    return Math.floor(Math.random() * 40) + 10; // 10-50 verses
  } else if (bookSlug.includes('john') || bookSlug.includes('peter')) {
    return Math.floor(Math.random() * 15) + 5; // 5-20 verses
  } else {
    return Math.floor(Math.random() * 25) + 8; // 8-33 verses
  }
}

// Generate the complete Ethiopian Bible dataset
function generateFullBible() {
  console.log('Generating complete Ethiopian Bible dataset...');
  
  const bibleData = /** @type {{ books: any[] }} */ ({
    books: []
  });
  
  let totalChapters = 0;
  let totalVerses = 0;
  
  for (const book of ETHIOPIAN_BIBLE_BOOKS) {
    console.log(`Generating ${book.name}...`);
    
    const bookData = /** @type {{ name: string, slug: string, chapters: any[] }} */ ({
      name: book.name,
      slug: book.slug,
      chapters: []
    });
    
    // Generate chapters for this book
    for (let chapterNum = 1; chapterNum <= book.chapters; chapterNum++) {
      const verseCount = getVerseCount(book.slug, chapterNum);
      const chapterData = /** @type {{ number: number, verses: any[] }} */ ({
        number: chapterNum,
        verses: []
      });
      
      // Generate verses for this chapter
      for (let verseNum = 1; verseNum <= verseCount; verseNum++) {
        chapterData.verses.push(/** @type {any} */ ({
          number: verseNum,
          text: generateVerseText(book.slug, chapterNum, verseNum)
        }));
      }
      
      bookData.chapters.push(/** @type {any} */ (chapterData));
      totalVerses += verseCount;
    }
    
    bibleData.books.push(/** @type {any} */ (bookData));
    totalChapters += book.chapters;
  }
  
  console.log(`Generated ${ETHIOPIAN_BIBLE_BOOKS.length} books, ${totalChapters} chapters, ${totalVerses} verses`);
  
  // Write to file
  const outputPath = path.join(__dirname, '../data/ethiopian-bible-complete.json');
  fs.writeFileSync(outputPath, JSON.stringify(bibleData, null, 2));
  
  console.log(`Complete Ethiopian Bible dataset saved to: ${outputPath}`);
  return outputPath;
}

// Run the generator
generateFullBible();
