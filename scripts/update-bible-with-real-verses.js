// /**
//  * ETHIOPIAN BIBLE VERSE UPDATER
//  * 
//  * This script replaces placeholder text in the database with actual
//  * Ethiopian Bible verses using the Bible API.
//  */

// import { PrismaClient } from '@prisma/client';
// import fetch from 'node-fetch';
// import { fileURLToPath } from 'url';
// import path from 'path';

// // Initialize Prisma client
// const prisma = new PrismaClient();

// // API key for the Bible API
// const API_KEY = "YOUR_API_KEY"; // Replace with your API key if using authentication

// // Function to fetch a Bible verse from API
// async function fetchBibleVerse(book, chapter, verse) {
//   try {
//     // Using the Bible API to get verse content
//     // You may need to adjust this URL based on the API you're using
//     const response = await fetch(
//       `https://bible-api.com/${book}+${chapter}:${verse}?translation=kjv`
//     );
    
//     const data = await response.json();
    
//     if (data && data.text) {
//       // Return the verse text
//       return data.text.trim();
//     } else {
//       console.log(`No verse found for ${book} ${chapter}:${verse}`);
//       return null;
//     }
//   } catch (error) {
//     console.error(`Error fetching verse ${book} ${chapter}:${verse}:`, error);
//     return null;
//   }
// }

// // Function to get Amharic translation (placeholder - you would need a real translation source)
// function getAmharicTranslation(englishText, bookName, chapterNum, verseNum) {
//   // This is a PLACEHOLDER function
//   // In a real implementation, you would:
//   // 1. Use a translation API
//   // 2. Or look up translations from a database of Amharic Bible verses
//   // 3. Or use a hard-coded mapping of key verses
  
//   // For now, let's use some example Amharic text based on what you provided in the template
//   if (bookName === "Genesis" && chapterNum === 1) {
//     if (verseNum === 1) return "በመጀመሪያ እግዚአብሔር ሰማይንና ምድርን ፈጠረ።";
//     if (verseNum === 2) return "ምድርም ባዶና ጨለማ ነበረች፥ በጨለማም ላይ ጸሎት ነበረ፤ የእግዚአብሔርም መንፈስ በውኃ ላይ ሰፈፈ።";
//     if (verseNum === 3) return "እግዚአብሔርም፦ ብርሃን ይሁን አለ፥ ብርሃንም ሆነ።";
//   }
  
//   if (bookName === "Joshua" && chapterNum === 4) {
//     if (verseNum === 1) return "ሕዝቡም ሁሉ ዮርዳኖስን ከተሻገሩ በኋላ፥ እግዚአብሔር ኢያሱን አለው።";
//     if (verseNum === 2) return "ከሕዝቡ አሥራ ሁለት ሰዎች ከየነገዱ አንድ አንድ ሰው ምረጥ፤";
//     // And so on for other specific verses...
//   }
  
//   // For other verses, return a placeholder stating this needs translation
//   return "ይህ ቁጥር የአማርኛ ትርጉም ያስፈልገዋል"; // "This verse needs Amharic translation"
// }

// // Main function to update all verses with actual text
// async function updateBibleVerses() {
//   console.log("Starting to update Bible verses with actual content...");
  
//   // Get all books
//   const books = await prisma.book.findMany({
//     include: {
//       chapters: {
//         include: {
//           verses: true
//         }
//       }
//     }
//   });
  
//   console.log(`Found ${books.length} books to update`);
  
//   // Process each book
//   for (const book of books) {
//     console.log(`Updating verses for book: ${book.name}`);
    
//     // Process each chapter
//     for (const chapter of book.chapters) {
//       console.log(`  Processing ${book.name} chapter ${chapter.number}`);
      
//       // Process each verse
//       for (const verse of chapter.verses) {
//         // Get verse text from API
//         const englishText = await fetchBibleVerse(book.name, chapter.number, verse.number);
        
//         if (englishText) {
//           // Get Amharic translation
//           const amharicText = getAmharicTranslation(englishText, book.name, chapter.number, verse.number);
          
//           // Format the complete verse text
//           const verseText = `${amharicText} (${englishText})`;
          
//           // Update verse in database
//           await prisma.verse.update({
//             where: { id: verse.id },
//             data: { text: verseText }
//           });
//         } else {
//           console.log(`  Skipping verse ${verse.number} - no content available`);
//         }
//       }
      
//       console.log(`  ✓ Updated verses in ${book.name} chapter ${chapter.number}`);
//     }
    
//     console.log(`✓ Completed ${book.name}`);
//   }
  
//   console.log("Bible verse update completed!");
// }

// // Main execution
// async function main() {
//   try {
//     await updateBibleVerses();
//     console.log("Successfully updated Bible verses with actual content!");
//   } catch (error) {
//     console.error("Error updating Bible verses:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // Run the script
// main();
