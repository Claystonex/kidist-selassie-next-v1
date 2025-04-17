// Bible Seeding Script with Type Assertions
// This script uses the BIBLE_BOOKS data to seed sample content

import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

// Use any type to bypass TypeScript checks
const prisma: any = new PrismaClient();

// Bible book data - canonical list with chapter counts
const BIBLE_BOOKS = [
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
  { name: 'Psalms', chapters: 150 },
  { name: 'Proverbs', chapters: 31 },
  { name: 'Ecclesiastes', chapters: 12 },
  { name: 'Song of Solomon', chapters: 8 },
  { name: 'Isaiah', chapters: 66 },
  { name: 'Jeremiah', chapters: 52 },
  { name: 'Lamentations', chapters: 5 },
  { name: 'Ezekiel', chapters: 48 },
  { name: 'Daniel', chapters: 12 },
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
  { name: 'Revelation', chapters: 22 }
];

// Function to generate sample verse content
function generateSampleVerseText(bookName: string, chapterNum: number, verseNum: number): string {
  return `This is sample verse ${verseNum} for ${bookName} ${chapterNum}. The actual Bible text would appear here in a real deployment.`;
}

// Main function to seed the database
async function seedBible() {
  try {
    // Check if Bible data already exists
    const existingBooks = await prisma.book.count();
    if (existingBooks > 0) {
      console.log('Bible data already exists in the database. Skipping seed.');
      return;
    }
    
    // Process each book
    for (const bookData of BIBLE_BOOKS) {
      console.log(`Processing book: ${bookData.name}`);
      
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
    
    console.log('Bible data seeded successfully!');
  } catch (error) {
    console.error('Error seeding Bible data:', error);
    throw error;
  }
}

// Execute the seed function
async function main() {
  try {
    await seedBible();
  } catch (error) {
    console.error('Failed to seed Bible data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
