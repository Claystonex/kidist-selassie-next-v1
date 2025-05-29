// /**
//  * Ethiopian Bible PDF to JSON Converter
//  * 
//  * This script converts a PDF of the Ethiopian Bible to a structured JSON format
//  * that can be directly used in the Selassie Youth website.
//  * 
//  * Usage: 
//  * 1. Install dependencies: npm install pdf-parse fs path
//  * 2. Run: node pdf-to-bible-json.js /path/to/your/bible.pdf
//  * 
//  * The output will be saved as ethiopian-bible.json in the same directory
//  */

// const fs = require('fs');
// const path = require('path');
// const pdfParse = require('pdf-parse');

// // Configuration
// const OUTPUT_FILE = path.join(__dirname, 'ethiopian-bible.json');

// // List of Ethiopian Bible books (standard + unique books)
// const BIBLE_BOOKS = [
//   // Standard books
//   'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
//   'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
//   '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
//   'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
//   'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
//   'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
//   'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
//   'Haggai', 'Zechariah', 'Malachi',
//   // New Testament
//   'Matthew', 'Mark', 'Luke', 'John', 'Acts',
//   'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
//   'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
//   '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
//   'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
//   'Jude', 'Revelation',
//   // Unique Ethiopian books
//   '1 Enoch', 'Jubilees', 'Rest of the Words of Baruch', 'Josippon',
//   'Book of the Covenant', 'Ethiopic Clement', 'Ethiopic Didascalia',
//   'Sinodos', 'Octateuch', 'Book of the Covenant 1', 'Book of the Covenant 2',
//   'Shepherd of Hermas'
// ];

// // Regex patterns for detecting Bible structure
// const PATTERNS = {
//   // Match patterns like "Genesis 1:1" or "1 Kings 3:16-18"
//   VERSE_REFERENCE: /([1-9])?\s*([A-Za-z\s]+)\s+(\d+):(\d+)(?:-(\d+))?/g,
//   // Match a chapter heading like "Chapter 1" or "CHAPTER 3"
//   CHAPTER_HEADING: /(?:Chapter|CHAPTER)\s+(\d+)/g,
//   // Match a book heading
//   BOOK_HEADING: new RegExp(`\\b(${BIBLE_BOOKS.join('|')})\\b`, 'g')
// };

// // Main function to process the PDF
// async function processPdf(pdfPath) {
//   console.log(`Processing PDF: ${pdfPath}`);
  
//   try {
//     // Read and parse the PDF
//     const dataBuffer = fs.readFileSync(pdfPath);
//     const data = await pdfParse(dataBuffer);
    
//     // Get the text content
//     const text = data.text;
//     console.log(`PDF parsed successfully. Total pages: ${data.numpages}`);
    
//     // Process the text into a structured Bible object
//     const bibleData = parseTextToBibleStructure(text);
    
//     // Save to JSON file
//     fs.writeFileSync(OUTPUT_FILE, JSON.stringify(bibleData, null, 2));
//     console.log(`Bible JSON saved to: ${OUTPUT_FILE}`);
    
//     // Print some statistics
//     let totalVerses = 0;
//     let totalChapters = 0;
//     let totalBooks = 0;
    
//     for (const book in bibleData) {
//       totalBooks++;
//       for (const chapter in bibleData[book]) {
//         totalChapters++;
//         totalVerses += Object.keys(bibleData[book][chapter]).length;
//       }
//     }
    
//     console.log(`Extracted: ${totalBooks} books, ${totalChapters} chapters, ${totalVerses} verses`);
    
//   } catch (error) {
//     console.error('Error processing PDF:', error);
//   }
// }

// // Parse the text content into a structured Bible object
// function parseTextToBibleStructure(text) {
//   console.log('Parsing text to Bible structure...');
  
//   // The Bible object we'll build
//   const bible = {};
  
//   // Split the text into lines for easier processing
//   const lines = text.split('\n').filter(line => line.trim().length > 0);
  
//   let currentBook = null;
//   let currentChapter = null;
  
//   // First pass: identify book and chapter boundaries
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i].trim();
    
//     // Check for book headings
//     for (const book of BIBLE_BOOKS) {
//       if (line === book || line.toUpperCase() === book.toUpperCase()) {
//         currentBook = book;
//         if (!bible[currentBook]) {
//           bible[currentBook] = {};
//         }
//         break;
//       }
//     }
    
//     // Check for chapter headings
//     const chapterMatch = line.match(PATTERNS.CHAPTER_HEADING);
//     if (chapterMatch && currentBook) {
//       currentChapter = chapterMatch[0].replace(/[^0-9]/g, '');
//       if (!bible[currentBook][currentChapter]) {
//         bible[currentBook][currentChapter] = {};
//       }
//     }
    
//     // Look for verse patterns
//     const verseMatches = [...line.matchAll(PATTERNS.VERSE_REFERENCE)];
//     if (verseMatches.length > 0 && currentBook && currentChapter) {
//       for (const match of verseMatches) {
//         // Extract book, chapter, verse from the match
//         const matchedBook = match[2]?.trim();
//         const matchedChapter = match[3];
//         const verseStart = match[4];
//         const verseEnd = match[5];
        
//         // If the matched book and chapter align with our current position
//         if (matchedBook && matchedBook.toLowerCase() === currentBook.toLowerCase() && 
//             matchedChapter === currentChapter) {
          
//           // Get the text after the verse reference
//           const verseContent = line.substring(match.index + match[0].length).trim();
          
//           // Add the verse
//           if (verseStart && verseContent) {
//             bible[currentBook][currentChapter][verseStart] = verseContent;
            
//             // If it's a verse range, duplicate the content for each verse in the range
//             if (verseEnd) {
//               for (let v = parseInt(verseStart) + 1; v <= parseInt(verseEnd); v++) {
//                 bible[currentBook][currentChapter][v.toString()] = verseContent;
//               }
//             }
//           }
//         }
//       }
//     }
//   }
  
//   // Second pass: look for content without explicit verse markings
//   let verseTextBuffer = '';
//   let lastVerseNumber = 0;
  
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i].trim();
    
//     // Skip empty lines
//     if (!line) continue;
    
//     // If we're in a valid book and chapter
//     if (currentBook && currentChapter) {
//       // Check if the line starts with a number (potential verse)
//       const verseNumberMatch = line.match(/^(\d+)\s+(.+)/);
      
//       if (verseNumberMatch) {
//         const verseNumber = verseNumberMatch[1];
//         const verseText = verseNumberMatch[2];
        
//         // If it's a sequential verse and not already captured
//         if (parseInt(verseNumber) === lastVerseNumber + 1 && 
//             !bible[currentBook][currentChapter][verseNumber]) {
//           bible[currentBook][currentChapter][verseNumber] = verseText;
//           lastVerseNumber = parseInt(verseNumber);
//         }
//       }
//       // If no verse number but we have text, append to the buffer
//       else if (!line.match(PATTERNS.CHAPTER_HEADING) && 
//                !BIBLE_BOOKS.includes(line)) {
//         verseTextBuffer += ' ' + line;
//       }
//     }
//   }
  
//   // Clean up and normalize the data
//   return cleanupBibleData(bible);
// }

// // Clean up and normalize the Bible data
// function cleanupBibleData(bible) {
//   console.log('Cleaning up Bible data...');
  
//   // Create a clean copy
//   const cleanBible = {};
  
//   for (const book in bible) {
//     cleanBible[book] = {};
    
//     for (const chapter in bible[book]) {
//       // Skip empty chapters
//       if (Object.keys(bible[book][chapter]).length === 0) continue;
      
//       cleanBible[book][chapter] = {};
      
//       for (const verse in bible[book][chapter]) {
//         // Clean up the verse text
//         let verseText = bible[book][chapter][verse];
        
//         // Remove any verse references within the text
//         verseText = verseText.replace(PATTERNS.VERSE_REFERENCE, '');
        
//         // Normalize whitespace
//         verseText = verseText.replace(/\s+/g, ' ').trim();
        
//         // Skip empty verses
//         if (verseText.length === 0) continue;
        
//         cleanBible[book][chapter][verse] = verseText;
//       }
      
//       // If no verses were added for this chapter, remove it
//       if (Object.keys(cleanBible[book][chapter]).length === 0) {
//         delete cleanBible[book][chapter];
//       }
//     }
    
//     // If no chapters were added for this book, remove it
//     if (Object.keys(cleanBible[book]).length === 0) {
//       delete cleanBible[book];
//     }
//   }
  
//   return cleanBible;
// }

// // Check command line arguments
// if (process.argv.length < 3) {
//   console.log('Usage: node pdf-to-bible-json.js /path/to/your/bible.pdf');
//   process.exit(1);
// }

// // Get the PDF path from command line arguments
// const pdfPath = process.argv[2];

// // Validate the file exists
// if (!fs.existsSync(pdfPath)) {
//   console.error(`Error: File not found - ${pdfPath}`);
//   process.exit(1);
// }

// // Run the main function
// processPdf(pdfPath);
