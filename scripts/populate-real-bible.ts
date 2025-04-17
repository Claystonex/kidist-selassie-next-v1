// Real Bible Text Populator for Kidist Selassie Website
// This script fetches real KJV Bible verses from an API and updates our database

import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { setTimeout } from 'timers/promises';

// Use any type to bypass TypeScript checks for Prisma models
const prisma: any = new PrismaClient();

// Bible API endpoints
const BIBLE_API_URL = 'https://bible-api.com';

// Sleep function to add delays between API calls
async function sleep(ms: number): Promise<void> {
  await setTimeout(ms);
}

// Fetch real Bible text
async function fetchChapterVerses(bookName: string, chapterNum: number): Promise<{[key: number]: string} | null> {
  try {
    console.log(`Fetching ${bookName} ${chapterNum}...`);
    
    // Format the reference for the API (e.g., "Genesis 1" or "1+Corinthians 13")
    const reference = `${bookName.replace(/ /g, '+')}+${chapterNum}`;
    const response = await axios.get(`${BIBLE_API_URL}/${reference}?translation=kjv`);
    
    if (response.status !== 200) {
      console.error(`Failed to fetch ${bookName} ${chapterNum}: Status ${response.status}`);
      return null;
    }
    
    const data = response.data;
    
    // Process the verses into a map of verse number to text
    const verses: {[key: number]: string} = {};
    
    if (data.verses && Array.isArray(data.verses)) {
      data.verses.forEach((verse: any) => {
        verses[verse.verse] = verse.text.trim();
      });
      return verses;
    } else {
      console.error(`Unexpected response format for ${bookName} ${chapterNum}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching ${bookName} ${chapterNum}:`, error);
    return null;
  }
}

// Update a chapter's verses with real text
async function updateChapterVerses(bookName: string, chapterNum: number): Promise<boolean> {
  try {
    // Find the book in our database
    const book = await prisma.book.findFirst({
      where: { name: bookName },
    });
    
    if (!book) {
      console.error(`Book not found: ${bookName}`);
      return false;
    }
    
    // Find the chapter in our database
    const chapter = await prisma.chapter.findFirst({
      where: { 
        number: chapterNum,
        bookId: book.id
      },
      include: {
        verses: true
      }
    });
    
    if (!chapter) {
      console.error(`Chapter not found: ${bookName} ${chapterNum}`);
      return false;
    }
    
    // Fetch the real verses from the API
    const realVerses = await fetchChapterVerses(bookName, chapterNum);
    
    if (!realVerses) {
      console.error(`Failed to get verses for ${bookName} ${chapterNum}`);
      return false;
    }
    
    // Update each verse in our database
    for (const verse of chapter.verses) {
      if (realVerses[verse.number]) {
        await prisma.verse.update({
          where: { id: verse.id },
          data: { text: realVerses[verse.number] }
        });
      }
    }
    
    console.log(`✅ Updated ${bookName} ${chapterNum}`);
    return true;
  } catch (error) {
    console.error(`Error updating ${bookName} ${chapterNum}:`, error);
    return false;
  }
}

// Process all books and chapters
async function populateRealBibleText() {
  try {
    // Get all books from our database
    const books = await prisma.book.findMany({
      include: {
        chapters: true
      }
    });
    
    console.log(`Found ${books.length} books in the database.`);
    
    // Process each book
    for (const book of books) {
      console.log(`Processing book: ${book.name}`);
      
      // Process each chapter 
      for (const chapter of book.chapters) {
        const success = await updateChapterVerses(book.name, chapter.number);
        
        if (!success) {
          console.warn(`  ⚠️ Failed to update ${book.name} ${chapter.number}`);
        }
        
        // Add a delay to avoid overwhelming the API
        await sleep(1000); // 1 second delay between chapters
      }
      
      // Add a longer delay between books
      await sleep(3000); // 3 seconds delay between books
    }
    
    console.log('Bible population completed!');
  } catch (error) {
    console.error('Error populating Bible text:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  console.log('Starting Bible text population...');
  await populateRealBibleText();
  console.log('Process completed.');
}

main();
