// /**
//  * ETHIOPIAN BIBLE - API VERSE UPDATE SCRIPT
//  * 
//  * This script updates Bible verses by fetching real content from a Bible API.
//  * It connects to a free Bible API to get verse content and updates your database.
//  */

// import { PrismaClient } from '@prisma/client';
// import fetch from 'node-fetch';

// // Initialize Prisma client
// const prisma = new PrismaClient();

// // Bible API configuration
// const API_BASE_URL = 'https://bible-api.com';

// // Function to get a verse from the Bible API
// async function getVerseFromAPI(book, chapter, verse) {
//   try {
//     // Format the API request (handle spaces in book names)
//     const formattedBook = book.replace(/ /g, '+');
//     const url = `${API_BASE_URL}/${formattedBook}+${chapter}:${verse}`;
    
//     // Make the API request
//     const response = await fetch(url);
//     const data = await response.json();
    
//     if (data && data.text) {
//       return data.text.trim();
//     }
    
//     return null;
//   } catch (error) {
//     console.error(`Error fetching ${book} ${chapter}:${verse} from API:`, error);
//     return null;
//   }
// }

// // Function to get Amharic text (for now using placeholders)
// // In a production app, you would connect to an Amharic Bible API or database
// function getAmharicText(book, chapter, verse, englishText) {
//   // Special cases for well-known verses
//   if (book === "Genesis" && chapter === 1) {
//     if (verse === 1) return "በመጀመሪያ እግዚአብሔር ሰማይንና ምድርን ፈጠረ።";
//     if (verse === 2) return "ምድርም ባዶና ጨለማ ነበረች፥ በጨለማም ላይ ጸሎት ነበረ፤ የእግዚአብሔርም መንፈስ በውኃ ላይ ሰፈፈ።";
//   }
  
//   if (book === "Psalms" && chapter === 23) {
//     if (verse === 1) return "እግዚአብሔር እረኛዬ ነው፥ የሚያሳጣኝም የለም።";
//   }
  
//   // Generic placeholder
//   return `${book} ${chapter}:${verse} በአማርኛ`;
// }

// // Main function to update verses from the API
// async function updateVersesFromAPI() {
//   console.log("Starting to update Bible verses with actual content from API...");
  
//   try {
//     // Get books to update (you can adjust this query to target specific books)
//     const books = await prisma.book.findMany({
//       take: 5, // Start with just a few books for testing
//       include: {
//         chapters: {
//           include: {
//             verses: true
//           }
//         }
//       }
//     });
    
//     console.log(`Found ${books.length} books to update`);
//     let totalUpdated = 0;
    
//     // Process each book
//     for (const book of books) {
//       console.log(`Processing book: ${book.name}`);
      
//       // Process each chapter
//       for (const chapter of book.chapters) {
//         console.log(`  Chapter ${chapter.number}`);
//         let chapterUpdated = 0;
        
//         // Process verses in smaller batches to avoid overwhelming the API
//         for (const verse of chapter.verses) {
//           // Get verse content from API
//           const englishText = await getVerseFromAPI(book.name, chapter.number, verse.number);
          
//           if (englishText) {
//             // Get corresponding Amharic text
//             const amharicText = getAmharicText(book.name, chapter.number, verse.number, englishText);
            
//             // Format the verse with both languages
//             const formattedText = `${amharicText} (${englishText})`;
            
//             // Update the verse in the database
//             await prisma.verse.update({
//               where: { id: verse.id },
//               data: { text: formattedText }
//             });
            
//             chapterUpdated++;
//             totalUpdated++;
//           } else {
//             console.log(`    Could not get content for ${book.name} ${chapter.number}:${verse.number}`);
//           }
          
//           // Add a small delay to avoid overwhelming the API
//           await new Promise(resolve => setTimeout(resolve, 100));
//         }
        
//         console.log(`    Updated ${chapterUpdated} verses in Chapter ${chapter.number}`);
//       }
//     }
    
//     console.log(`Successfully updated ${totalUpdated} verses with content from the Bible API!`);
//   } catch (error) {
//     console.error("Error updating verses from API:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // Run the script
// updateVersesFromAPI();
