// @ts-nocheck
/**
 * Ethiopian Bible Import Script
 * 
 * This script helps import actual Ethiopian Bible verses into the database.
 * It requires a properly formatted JSON file containing the Bible data.
 * 
 * Usage:
 * 1. Create a JSON file with Ethiopian Bible verses
 * 2. Run this script with: node scripts/import-bible-verses.js
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Prisma client
const prisma = new PrismaClient();

// Path to your Bible data file
const BIBLE_DATA_PATH = path.join(__dirname, '../data/ethiopian-bible-complete.json');

// CLI: allow book-by-book import
const args = process.argv.slice(2);
function getArg(name, short) {
  const i = args.indexOf(name);
  if (i !== -1 && i + 1 < args.length) return args[i + 1];
  if (short) {
    const j = args.indexOf(short);
    if (j !== -1 && j + 1 < args.length) return args[j + 1];
  }
  return null;
}
const bookFilter = getArg('--book', '-b');

// Split combined bilingual verse text: "<Amharic> (<English>)"
function splitBilingualText(combined) {
  if (typeof combined !== 'string') return { amharic: null, english: null };
  const m = combined.match(/^(.*?)\s*\((.+?)\)\s*$/);
  if (m && m[1] != null && m[2] != null) {
    return { amharic: m[1].trim(), english: m[2].trim() };
  }
  return { amharic: combined.trim(), english: null };
}

async function importBibleData() {
  try {
    console.log('Starting Ethiopian Bible import...');
    
    // Check if the data file exists
    if (!fs.existsSync(BIBLE_DATA_PATH)) {
      console.error(`Error: Bible data file not found at ${BIBLE_DATA_PATH}`);
      console.log(`Please create the file with Ethiopian Bible verses before running this script.`);
      return;
    }
    
    // Read the Bible data file
    const bibleData = JSON.parse(fs.readFileSync(BIBLE_DATA_PATH, 'utf8'));

    const allBooks = Array.isArray(bibleData.books) ? bibleData.books : [];
    const booksToProcess = bookFilter
      ? allBooks.filter((b) => {
          const target = bookFilter.toLowerCase();
          const byName = (b.name || '').toLowerCase() === target;
          const bySlug = (b.slug || '').toLowerCase() === target;
          return byName || bySlug;
        })
      : allBooks;

    if (bookFilter) {
      if (booksToProcess.length === 0) {
        console.warn(`No book matched filter "${bookFilter}". Available examples:`, allBooks.slice(0, 3).map(b => b.name));
        return;
      }
      console.log(`Filtering import to book: ${bookFilter}`);
    }
    
    console.log('Processing Bible books...');
    
    // Process each book individually to avoid transaction timeouts
    for (const book of booksToProcess) {
      console.log(`Importing ${book.name}...`);
      const slug = (book.slug && String(book.slug)) || slugify(String(book.name || ''), { lower: true, strict: true });

      // Create or update the book first
      const dbBook = await prisma.book.upsert({
        where: { slug },
        update: { name: book.name },
        create: {
          name: book.name,
          slug,
        },
      });
      
      // Process each chapter in its own transaction to avoid timeouts
      for (const chapter of book.chapters) {
        console.log(`  Chapter ${chapter.number}`);
        
        await prisma.$transaction(async (tx) => {
          // Find existing chapter or create a new one
          let dbChapter = await tx.chapter.findFirst({
            where: {
              bookId: dbBook.id,
              number: chapter.number,
            },
          });
          
          // If chapter doesn't exist, create it
          if (!dbChapter) {
            dbChapter = await tx.chapter.create({
              data: {
                number: chapter.number,
                bookId: dbBook.id,
              },
            });
          }
          
          // Delete existing verses to avoid duplicates
          await tx.verse.deleteMany({
            where: { chapterId: dbChapter.id },
          });
          
          // Create verses for this chapter
          for (const verse of chapter.verses) {
            const { amharic, english } = splitBilingualText(verse.text);
            await tx.verse.create({
              data: /** @type {any} */ ({
                number: verse.number,
                text: verse.text,
                textAm: amharic,
                textEn: english,
                chapterId: dbChapter.id,
              }),
            });
          }
        });
      }
      
      console.log(`✓ Completed ${book.name}`);
    }
    
    if (bookFilter) {
      console.log(`Bible import completed successfully for book: ${bookFilter}`);
    } else {
      console.log('Bible import completed successfully!');
    }
  } catch (error) {
    console.error('Error importing Bible data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importBibleData();
