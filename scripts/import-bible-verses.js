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

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Prisma client
const prisma = new PrismaClient();

// Path to your Bible data file
const BIBLE_DATA_PATH = path.join(__dirname, '../data/ethiopian-bible-template.json');

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
    
    // Start a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      console.log('Processing Bible books...');
      
      // Process each book
      for (const book of bibleData.books) {
        console.log(`Importing ${book.name}...`);
        
        // Create or update the book
        const dbBook = await tx.book.upsert({
          where: { slug: book.slug },
          update: { name: book.name },
          create: {
            name: book.name,
            slug: book.slug,
          },
        });
        
        // Process each chapter in this book
        for (const chapter of book.chapters) {
          console.log(`  Chapter ${chapter.number}`);
          
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
            await tx.verse.create({
              data: {
                number: verse.number,
                text: verse.text,
                chapterId: dbChapter.id,
              },
            });
          }
        }
      }
      
      console.log('Bible import completed successfully!');
    });
  } catch (error) {
    console.error('Error importing Bible data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importBibleData();
