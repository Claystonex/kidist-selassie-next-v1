// /**
//  * HYBRID ETHIOPIAN BIBLE UPDATE
//  * 
//  * This script takes a practical approach to updating Bible verses:
//  * - Uses standard Bible API for overlapping books
//  * - Adds placeholders for unique Ethiopian books
//  * - Includes simple Amharic text where available
//  */

// import { PrismaClient } from '@prisma/client';
// import fetch from 'node-fetch';

// // Initialize Prisma client
// const prisma = new PrismaClient();

// // Bible API configuration
// const API_BASE_URL = 'https://bible-api.com';

// // List of books unique to Ethiopian Bible
// const ETHIOPIAN_UNIQUE_BOOKS = [
//   '1 Enoch', 'Jubilees', 'Rest of the Words of Baruch', 'Josippon',
//   'Book of the Covenant', 'Ethiopic Clement', 'Ethiopic Didascalia',
//   'Sinodos', 'Octateuch', 'Book of the Covenant 1', 'Book of the Covenant 2',
//   'Shepherd of Hermas'
// ];

// // Function to get a verse from the Bible API
// async function getVerseFromAPI(book, chapter, verse) {
//   try {
//     // Skip API call for Ethiopian-unique books
//     if (ETHIOPIAN_UNIQUE_BOOKS.includes(book)) {
//       return `[This is a placeholder for ${book} ${chapter}:${verse}, which is unique to the Ethiopian Bible]`;
//     }
    
//     // Format the API request (handle spaces in book names)
//     const formattedBook = book.replace(/ /g, '+');
//     const url = `${API_BASE_URL}/${formattedBook}+${chapter}:${verse}`;
    
//     // Make the API request
//     const response = await fetch(url);
//     const data = await response.json();
    
//     if (data && data.text) {
//       return data.text.trim();
//     }
    
//     return `[Verse text for ${book} ${chapter}:${verse} not available]`;
//   } catch (error) {
//     console.error(`Error fetching ${book} ${chapter}:${verse} from API:`, error);
//     return `[Error retrieving verse ${book} ${chapter}:${verse}]`;
//   }
// }

// // Simple Amharic text examples for demonstration
// const AMHARIC_SAMPLES = {
//   "Genesis_1_1": "በመጀመሪያ እግዚአብሔር ሰማይንና ምድርን ፈጠረ።",
//   "Genesis_1_2": "ምድርም ባዶና ጨለማ ነበረች፥ በጨለማም ላይ ጸሎት ነበረ፤ የእግዚአብሔርም መንፈስ በውኃ ላይ ሰፈፈ።",
//   "Genesis_1_3": "እግዚአብሔርም፦ ብርሃን ይሁን አለ፥ ብርሃንም ሆነ።",
//   "Psalms_23_1": "እግዚአብሔር እረኛዬ ነው፥ የሚያሳጣኝም የለም።",
//   "Psalms_23_2": "በመስመሌ ያሳድረኛል፥ ወደ ዐረፍት ውኃም ይወስደኛል።",
//   "Joshua_4_1": "ሕዝቡም ሁሉ ዮርዳኖስን ከተሻገሩ በኋላ፥ እግዚአብሔር ኢያሱን አለው።"
// };

// // Function to get simple Amharic text for a verse
// function getAmharicText(book, chapter, verse) {
//   const key = `${book}_${chapter}_${verse}`;
//   if (AMHARIC_SAMPLES[key]) {
//     return AMHARIC_SAMPLES[key];
//   }
  
//   // For Ethiopian-unique books, return a placeholder in Amharic
//   if (ETHIOPIAN_UNIQUE_BOOKS.includes(book)) {
//     return `[${book} ${chapter}:${verse} በአማርኛ ያስፈልጋል]`;
//   }
  
//   // Return a generic Amharic placeholder
//   return `${book} ${chapter}:${verse} በአማርኛ`;
// }

// // Main function to update verses
// async function updateBibleVerses() {
//   console.log("Starting to update Bible verses with hybrid approach...");
  
//   try {
//     // Get all books
//     const books = await prisma.book.findMany({
//       include: {
//         chapters: {
//           take: 3, // Limit to 3 chapters per book for testing
//           include: {
//             verses: {
//               take: 10 // Limit to 10 verses per chapter for testing
//             }
//           }
//         }
//       }
//     });
    
//     console.log(`Found ${books.length} books to process`);
//     let totalUpdated = 0;
    
//     // Process each book
//     for (const book of books) {
//       console.log(`Processing book: ${book.name}`);
      
//       // Process each chapter
//       for (const chapter of book.chapters) {
//         console.log(`  Chapter ${chapter.number}`);
//         let chapterUpdated = 0;
        
//         // Process verses
//         for (const verse of chapter.verses) {
//           // Skip verses that don't look like placeholders
//           if (!verse.text.includes("sample verse") && !verse.text.includes("placeholder")) {
//             continue;
//           }
          
//           // Get English text from API
//           const englishText = await getVerseFromAPI(book.name, chapter.number, verse.number);
          
//           // Get Amharic text
//           const amharicText = getAmharicText(book.name, chapter.number, verse.number);
          
//           // Format the verse text
//           const verseText = `${amharicText} (${englishText})`;
          
//           // Update the verse
//           await prisma.verse.update({
//             where: { id: verse.id },
//             data: { text: verseText }
//           });
          
//           chapterUpdated++;
//           totalUpdated++;
          
//           // Small delay to avoid overwhelming the API
//           await new Promise(resolve => setTimeout(resolve, 100));
//         }
        
//         console.log(`    Updated ${chapterUpdated} verses in Chapter ${chapter.number}`);
//       }
//     }
    
//     console.log(`Successfully updated ${totalUpdated} verses using the hybrid approach!`);
//   } catch (error) {
//     console.error("Error updating verses:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // Run the script
// updateBibleVerses();
