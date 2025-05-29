// /**
//  * ETHIOPIAN BIBLE VERSE LOADER
//  * 
//  * A simple script that replaces placeholder text with actual Ethiopian Bible verses.
//  * This uses a standard Bible API to get the verse content in English and formats it
//  * for your database.
//  */

// import { PrismaClient } from '@prisma/client';
// import fetch from 'node-fetch';

// // Initialize Prisma client
// const prisma = new PrismaClient();

// // Simple function to fetch a Bible verse in English
// async function getVerseText(book, chapter, verse) {
//   try {
//     // Using a public Bible API to get the verse content
//     const response = await fetch(`https://bible-api.com/${book}+${chapter}:${verse}`);
//     const data = await response.json();
    
//     if (data && data.text) {
//       return data.text.trim();
//     }
//     return `${book} ${chapter}:${verse} - Verse text not available`;
//   } catch (error) {
//     console.error(`Error fetching ${book} ${chapter}:${verse}:`, error);
//     return `${book} ${chapter}:${verse} - Verse text not available`;
//   }
// }

// // Main function to update verses
// async function loadRealVerses() {
//   console.log("Loading real Bible verses into database...");
  
//   try {
//     // Get all verses from database
//     const verses = await prisma.verse.findMany({
//       include: {
//         chapter: {
//           include: {
//             book: true
//           }
//         }
//       }
//     });
    
//     console.log(`Found ${verses.length} verses to update`);
    
//     // Update verses in small batches to avoid overwhelming the database
//     const BATCH_SIZE = 10;
//     for (let i = 0; i < verses.length; i += BATCH_SIZE) {
//       const batch = verses.slice(i, i + BATCH_SIZE);
      
//       // Process each verse in the batch
//       for (const verse of batch) {
//         const book = verse.chapter.book.name;
//         const chapter = verse.chapter.number;
//         const verseNum = verse.number;
        
//         // Get the actual verse text from the Bible API
//         const verseText = await getVerseText(book, chapter, verseNum);
        
//         // Update the verse in the database
//         await prisma.verse.update({
//           where: { id: verse.id },
//           data: { text: verseText }
//         });
        
//         console.log(`Updated ${book} ${chapter}:${verseNum}`);
//       }
      
//       console.log(`Processed ${i + batch.length} of ${verses.length} verses`);
//     }
    
//     console.log("All verses have been updated with real text!");
//   } catch (error) {
//     console.error("Error updating verses:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // Run the script
// loadRealVerses();
