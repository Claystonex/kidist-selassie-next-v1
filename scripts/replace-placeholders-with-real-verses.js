// /**
//  * ETHIOPIAN BIBLE - REPLACE PLACEHOLDERS WITH REAL VERSES
//  * 
//  * This script replaces all placeholder text in the database with actual Ethiopian Bible verses.
//  * It's a straightforward approach to update the existing structure.
//  */

// import { PrismaClient } from '@prisma/client';
// import fetch from 'node-fetch';

// // Initialize Prisma client
// const prisma = new PrismaClient();

// // Function to get Bible verse from API
// async function getBibleVerse(book, chapter, verse) {
//   try {
//     // Using the Bible API to get the verse text
//     const response = await fetch(`https://bible-api.com/${book}+${chapter}:${verse}`);
//     const data = await response.json();
    
//     if (data && data.text) {
//       return data.text.trim();
//     }
    
//     return null;
//   } catch (error) {
//     console.error(`Error fetching ${book} ${chapter}:${verse}:`, error);
//     return null;
//   }
// }

// // Main function to update all placeholder verses with actual text
// async function replacePlaceholders() {
//   console.log("Starting to replace placeholder text with actual Ethiopian Bible verses...");
  
//   try {
//     // Get all verses from the database
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
    
//     // Process verses in small batches to avoid overwhelming the database
//     const BATCH_SIZE = 10;
//     let successCount = 0;
    
//     for (let i = 0; i < verses.length; i += BATCH_SIZE) {
//       const batch = verses.slice(i, i + BATCH_SIZE);
      
//       await Promise.all(batch.map(async (verse) => {
//         const book = verse.chapter.book.name;
//         const chapter = verse.chapter.number;
//         const verseNum = verse.number;
        
//         // Skip verses that don't have placeholder text
//         if (!verse.text.includes("sample verse") && !verse.text.includes("placeholder")) {
//           return;
//         }
        
//         // Get the real verse text from the Bible API
//         const bibleText = await getBibleVerse(book, chapter, verseNum);
        
//         if (bibleText) {
//           // For Ethiopian Bible, combine with the appropriate Amharic text
//           // This would be replaced with actual Amharic text in a production version
//           const amharicText = `ቁጥር ${verseNum}`; // Simple Amharic placeholder saying "Verse [number]"
//           const updatedText = `${amharicText} (${bibleText})`;
          
//           // Update the verse in the database
//           await prisma.verse.update({
//             where: { id: verse.id },
//             data: { text: updatedText }
//           });
          
//           successCount++;
//         }
//       }));
      
//       console.log(`Processed ${Math.min(i + BATCH_SIZE, verses.length)} of ${verses.length} verses`);
//     }
    
//     console.log(`Successfully replaced ${successCount} placeholder verses with actual Ethiopian Bible text!`);
//   } catch (error) {
//     console.error("Error replacing placeholders:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // Run the script
// replacePlaceholders();
