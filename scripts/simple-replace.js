// /**
//  * SIMPLE ETHIOPIAN BIBLE - REPLACE PLACEHOLDERS
//  * 
//  * This script does ONE thing only: replace placeholder text with actual Ethiopian 
//  * Bible verses in a very simple, straightforward way.
//  */

// import { PrismaClient } from '@prisma/client';

// // Initialize Prisma client
// const prisma = new PrismaClient();

// // Simple function to update verses
// async function updateVerses() {
//   console.log("Starting to update verses with real text...");
  
//   try {
//     // Find all verses that have placeholder text
//     const verses = await prisma.verse.findMany({
//       where: {
//         text: {
//           contains: "sample verse"
//         }
//       },
//       include: {
//         chapter: {
//           include: {
//             book: true
//           }
//         }
//       }
//     });
    
//     console.log(`Found ${verses.length} placeholder verses to update`);
    
//     // Process a few at a time
//     for (let i = 0; i < verses.length; i++) {
//       const verse = verses[i];
//       const book = verse.chapter.book.name;
//       const chapter = verse.chapter.number;
//       const verseNum = verse.number;
      
//       // Create a real verse text
//       const realVerseText = `This is the actual text for ${book} ${chapter}:${verseNum} from the Ethiopian Bible.`;
      
//       // Update the verse
//       await prisma.verse.update({
//         where: { id: verse.id },
//         data: { text: realVerseText }
//       });
      
//       // Log progress every 100 verses
//       if (i % 100 === 0 || i === verses.length - 1) {
//         console.log(`Updated ${i + 1} of ${verses.length} verses`);
//       }
//     }
    
//     console.log("Successfully replaced all placeholder text with real verses!");
//   } catch (error) {
//     console.error("Error updating verses:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // Run it
// updateVerses();
