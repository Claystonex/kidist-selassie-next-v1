// Ethiopian Bible Seeding Script 
// This script seeds the Bible database with canonical books + Ethiopian Orthodox additional books

import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

// Use PrismaClient
const prisma = new PrismaClient();

// Bible book data - canonical list with chapter counts + Ethiopian Orthodox additional books
const BIBLE_BOOKS = [
  // Old Testament (39 books)
  { name: 'Genesis', chapters: 50 },
  { name: 'Exodus', chapters: 40 },
  { name: 'Leviticus', chapters: 27 },
  { name: 'Numbers', chapters: 36 },
  { name: 'Deuteronomy', chapters: 34 },
  { name: 'Joshua', chapters: 24 },
  { name: 'Judges', chapters: 21 },
  { name: 'Ruth', chapters: 4 },
  { name: '1 Samuel', chapters: 31 },
  { name: '2 Samuel', chapters: 24 },
  { name: '1 Kings', chapters: 22 },
  { name: '2 Kings', chapters: 25 },
  { name: '1 Chronicles', chapters: 29 },
  { name: '2 Chronicles', chapters: 36 },
  { name: 'Ezra', chapters: 10 },
  { name: 'Nehemiah', chapters: 13 },
  { name: 'Esther', chapters: 10 },
  { name: 'Job', chapters: 42 },
  { name: 'Psalms', chapters: 151 }, // Ethiopian Bible has 151 Psalms
  { name: 'Proverbs', chapters: 31 },
  { name: 'Ecclesiastes', chapters: 12 },
  { name: 'Song of Solomon', chapters: 8 },
  { name: 'Isaiah', chapters: 66 },
  { name: 'Jeremiah', chapters: 52 },
  { name: 'Lamentations', chapters: 5 },
  { name: 'Ezekiel', chapters: 48 },
  { name: 'Daniel', chapters: 14 }, // Ethiopian Bible includes additional chapters in Daniel
  { name: 'Hosea', chapters: 14 },
  { name: 'Joel', chapters: 3 },
  { name: 'Amos', chapters: 9 },
  { name: 'Obadiah', chapters: 1 },
  { name: 'Jonah', chapters: 4 },
  { name: 'Micah', chapters: 7 },
  { name: 'Nahum', chapters: 3 },
  { name: 'Habakkuk', chapters: 3 },
  { name: 'Zephaniah', chapters: 3 },
  { name: 'Haggai', chapters: 2 },
  { name: 'Zechariah', chapters: 14 },
  { name: 'Malachi', chapters: 4 },
  
  // Deuterocanonical/Ethiopian Orthodox Books
  { name: 'Tobit', chapters: 14 },
  { name: 'Judith', chapters: 16 },
  { name: 'Wisdom of Solomon', chapters: 19 },
  { name: 'Ecclesiasticus', chapters: 51 }, // Also known as Sirach
  { name: 'Baruch', chapters: 6 }, // Includes Letter of Jeremiah as chapter 6
  { name: '1 Maccabees', chapters: 16 },
  { name: '2 Maccabees', chapters: 15 },
  { name: '3 Maccabees', chapters: 7 },
  { name: '4 Maccabees', chapters: 18 },
  
  // Books unique to the Ethiopian Orthodox Canon
  { name: '1 Enoch', chapters: 108 }, // Also known as Ethiopian Book of Enoch
  { name: 'Jubilees', chapters: 50 },
  { name: 'Rest of the Words of Baruch', chapters: 5 }, // Also known as 4 Baruch
  { name: 'Josippon', chapters: 8 }, // Ethiopian historical book
  { name: 'Book of the Covenant', chapters: 2 }, // Mäṣḥafä Kidan
  { name: 'Ethiopic Clement', chapters: 8 }, // Qalēmenṭos
  { name: 'Ethiopic Didascalia', chapters: 43 }, // Didəsqəlya
  { name: 'Sinodos', chapters: 33 }, // Canonical collection
  { name: 'Octateuch', chapters: 8 }, // Ecclesiastical constitution
  { name: 'Book of the Covenant 1', chapters: 60 }, // Mäṣḥafä Kidan I
  { name: 'Book of the Covenant 2', chapters: 19 }, // Mäṣḥafä Kidan II
  
  // New Testament (27 books)
  { name: 'Matthew', chapters: 28 },
  { name: 'Mark', chapters: 16 },
  { name: 'Luke', chapters: 24 },
  { name: 'John', chapters: 21 },
  { name: 'Acts', chapters: 28 },
  { name: 'Romans', chapters: 16 },
  { name: '1 Corinthians', chapters: 16 },
  { name: '2 Corinthians', chapters: 13 },
  { name: 'Galatians', chapters: 6 },
  { name: 'Ephesians', chapters: 6 },
  { name: 'Philippians', chapters: 4 },
  { name: 'Colossians', chapters: 4 },
  { name: '1 Thessalonians', chapters: 5 },
  { name: '2 Thessalonians', chapters: 3 },
  { name: '1 Timothy', chapters: 6 },
  { name: '2 Timothy', chapters: 4 },
  { name: 'Titus', chapters: 3 },
  { name: 'Philemon', chapters: 1 },
  { name: 'Hebrews', chapters: 13 },
  { name: 'James', chapters: 5 },
  { name: '1 Peter', chapters: 5 },
  { name: '2 Peter', chapters: 3 },
  { name: '1 John', chapters: 5 },
  { name: '2 John', chapters: 1 },
  { name: '3 John', chapters: 1 },
  { name: 'Jude', chapters: 1 },
  { name: 'Revelation', chapters: 22 },
  
  // Broader Apocrypha & Pseudepigrapha often referenced
  { name: 'Jasher', chapters: 91 },
  { name: '2 Enoch', chapters: 73 },
  { name: '3 Enoch', chapters: 48 },
  { name: 'Shepherd of Hermas', chapters: 114 }
];

// Function to generate sample verse content
function generateSampleVerseText(bookName, chapterNum, verseNum) {
  return `This is sample verse ${verseNum} for ${bookName} ${chapterNum}. The actual Bible text would appear here in a real deployment.`;
}

// Helper function to categorize books
function getTestament(bookName) {
  const newTestamentBooks = [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
    '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
    'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
    'Jude', 'Revelation'
  ];
  
  const ethiopianBooks = [
    '1 Enoch', 'Jubilees', 'Rest of the Words of Baruch', 'Josippon',
    'Book of the Covenant', 'Ethiopic Clement', 'Ethiopic Didascalia',
    'Sinodos', 'Octateuch', 'Book of the Covenant 1', 'Book of the Covenant 2'
  ];
  
  const apocryphalBooks = [
    'Tobit', 'Judith', 'Wisdom of Solomon', 'Ecclesiasticus', 
    'Baruch', '1 Maccabees', '2 Maccabees', '3 Maccabees', '4 Maccabees'
  ];
  
  const pseudepigraphaBooks = [
    'Jasher', '2 Enoch', '3 Enoch', 'Shepherd of Hermas'
  ];
  
  if (newTestamentBooks.includes(bookName)) {
    return 'New Testament';
  } else if (ethiopianBooks.includes(bookName)) {
    return 'Ethiopian Orthodox';
  } else if (apocryphalBooks.includes(bookName)) {
    return 'Deuterocanonical';
  } else if (pseudepigraphaBooks.includes(bookName)) {
    return 'Pseudepigrapha';
  } else {
    return 'Old Testament';
  }
}

// Function to clear existing Bible data
async function clearExistingBibleData() {
  try {
    // Delete all verses first (due to foreign key constraints)
    await prisma.verse.deleteMany({});
    console.log('Deleted all verses');
    
    // Delete all chapters
    await prisma.chapter.deleteMany({});
    console.log('Deleted all chapters');
    
    // Delete all books
    await prisma.book.deleteMany({});
    console.log('Deleted all books');
    
    console.log('Successfully cleared existing Bible data');
  } catch (error) {
    console.error('Error clearing Bible data:', error);
    throw error;
  }
}

// Main function to seed the database
async function seedBible() {
  try {
    // Clear existing Bible data
    await clearExistingBibleData();
    
    // Process each book
    for (const bookData of BIBLE_BOOKS) {
      const testament = getTestament(bookData.name);
      console.log(`Processing book: ${bookData.name} (${testament})`);
      
      // Create book record
      const bookSlug = slugify(bookData.name, { lower: true, strict: true });
      const book = await prisma.book.create({
        data: {
          name: bookData.name,
          slug: bookSlug,
        },
      });
      
      // Process each chapter in the book
      for (let chapterNum = 1; chapterNum <= bookData.chapters; chapterNum++) {
        console.log(`  Processing ${bookData.name} chapter ${chapterNum}`);
        
        // Create chapter record
        const chapter = await prisma.chapter.create({
          data: {
            number: chapterNum,
            bookId: book.id,
          },
        });
        
        // Create verse records with sample text
        // Average verse count per chapter
        const verseCount = Math.floor(Math.random() * 15) + 15; // Random between 15-30 verses
        
        for (let verseNum = 1; verseNum <= verseCount; verseNum++) {
          const verseText = generateSampleVerseText(bookData.name, chapterNum, verseNum);
          
          await prisma.verse.create({
            data: {
              number: verseNum,
              text: verseText,
              chapterId: chapter.id,
            },
          });
        }
      }
    }
    
    console.log('Ethiopian Bible data (including canonical, deuterocanonical and Ethiopian Orthodox books) seeded successfully!');
  } catch (error) {
    console.error('Error seeding Bible data:', error);
    throw error;
  }
}

// Execute the seed function
async function main() {
  try {
    console.log('Starting to seed the complete Ethiopian Bible...');
    await seedBible();
    console.log('Completed seeding the Bible database!');
  } catch (error) {
    console.error('Failed to seed Bible data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
