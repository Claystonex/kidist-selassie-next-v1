import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import type { Metadata } from 'next';

// Define metadata for SEO
export const metadata: Metadata = {
  title: 'Holy Bible | Kidist Selassie Youth International Network',
  description: 'Read the Bible online - Kidist Selassie Youth International Network',
};

// Fetch all Bible books from the database
async function getBooks() {
  const prisma = new PrismaClient();
  try {
    // Using PrismaClient type workaround
    const books = await (prisma as any).book.findMany({
      orderBy: { id: 'asc' },
    });
    return books;
  } catch (error) {
    console.error('Error fetching Bible books:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

// Group books by Ethiopian Orthodox Canon categories
function groupBooksByTestament(books: any[]) {
  // Organize books according to Ethiopian Orthodox tradition
  
  // Octateuch (8 books of law)
  const octateukhBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth'
  ];
  
  // Books of Kingdoms (historical books)
  const kingdomBooks = [
    '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', 
    '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther'
  ];
  
  // Poetic Books
  const poeticBooks = [
    'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon'
  ];
  
  // Major Prophets
  const majorProphetsBooks = [
    'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel'
  ];
  
  // Minor Prophets (12 books)
  const minorProphetsBooks = [
    'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 
    'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 
    'Zechariah', 'Malachi'
  ];
  
  // New Testament
  const newTestamentBooks = [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
    '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
    'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
    'Jude', 'Revelation'
  ];
  
  // Broader Canon (Deuterocanonical books accepted in Ethiopian Orthodox Canon)
  const deuterocanonicalBooks = [
    'Tobit', 'Judith', 'Wisdom of Solomon', 'Ecclesiasticus', // Also known as Sirach
    'Baruch', '1 Maccabees', '2 Maccabees', '3 Maccabees', '4 Maccabees'
  ];
  
  // Unique to Ethiopian Orthodox Canon
  const ethiopianBooks = [
    '1 Enoch', 'Jubilees', 'Rest of the Words of Baruch', 
    'Josippon', 'Book of the Covenant', 'Ethiopic Clement', 
    'Ethiopic Didascalia', 'Sinodos', 'Octateuch', 
    'Book of the Covenant 1', 'Book of the Covenant 2'
  ];
  
  // Other related texts
  const otherTexts = [
    'Jasher', '2 Enoch', '3 Enoch', 'Shepherd of Hermas',
    'Additions to Esther', 'Song of the Three Children', 
    'Story of Susanna', 'Bel and the Dragon', 'Prayer of Manasseh'
  ];
  
  return {
    octateukh: books.filter(book => octateukhBooks.includes(book.name)),
    kingdoms: books.filter(book => kingdomBooks.includes(book.name)),
    poetic: books.filter(book => poeticBooks.includes(book.name)),
    majorProphets: books.filter(book => majorProphetsBooks.includes(book.name)),
    minorProphets: books.filter(book => minorProphetsBooks.includes(book.name)),
    newTestament: books.filter(book => newTestamentBooks.includes(book.name)),
    deuterocanonical: books.filter(book => deuterocanonicalBooks.includes(book.name)),
    ethiopian: books.filter(book => ethiopianBooks.includes(book.name)),
    otherTexts: books.filter(book => otherTexts.includes(book.name))
  };
}

export default async function BiblePage() {
  const books = await getBooks();
  const { 
    octateukh, kingdoms, poetic, majorProphets, minorProphets,
    newTestament, deuterocanonical, ethiopian, otherTexts 
  } = groupBooksByTestament(books);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#064d32]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-4">ቅዱስ መጽሐፍ - Holy Bible</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Read and study the Word of God according to the Ethiopian Orthodox Tewahedo tradition. Select a book below to begin reading.
          </p>
        </div>

        {/* Old Testament Books */}
        <h2 className="text-2xl font-semibold text-yellow-400 mb-4 text-center">ብሉይ ኪዳን - Old Testament</h2>
        
        {/* Octateuch */}
        <div className="bg-[#043a26] rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">Octateuch (Law)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4">
            {octateukh.map((book) => (
              <Link 
                href={`/bible/${book.slug}`} 
                key={book.id}
                className="text-white hover:text-yellow-300 transition"
              >
                {book.name}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Historical Books */}
        <div className="bg-[#043a26] rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">Historical Books</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4">
            {kingdoms.map((book) => (
              <Link 
                href={`/bible/${book.slug}`} 
                key={book.id}
                className="text-white hover:text-yellow-300 transition"
              >
                {book.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Two columns layout for Poetic and Prophetic books */}
        <div className="grid gap-8 md:grid-cols-2 mb-8">
          {/* Poetic Books */}
          <div className="bg-[#043a26] rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Poetic Books</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
              {poetic.map((book) => (
                <Link 
                  href={`/bible/${book.slug}`} 
                  key={book.id}
                  className="text-white hover:text-yellow-300 transition"
                >
                  {book.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Major Prophets */}
          <div className="bg-[#043a26] rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Major Prophets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
              {majorProphets.map((book) => (
                <Link 
                  href={`/bible/${book.slug}`} 
                  key={book.id}
                  className="text-white hover:text-yellow-300 transition"
                >
                  {book.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Minor Prophets */}
        <div className="bg-[#043a26] rounded-lg shadow-xl p-6 mb-10">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">Minor Prophets</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4">
            {minorProphets.map((book) => (
              <Link 
                href={`/bible/${book.slug}`} 
                key={book.id}
                className="text-white hover:text-yellow-300 transition"
              >
                {book.name}
              </Link>
            ))}
          </div>
        </div>

        {/* New Testament */}
        <h2 className="text-2xl font-semibold text-yellow-400 mb-4 text-center">ሐዲስ ኪዳን - New Testament</h2>
        <div className="bg-[#043a26] rounded-lg shadow-xl p-6 mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4">
            {newTestament.map((book) => (
              <Link 
                href={`/bible/${book.slug}`} 
                key={book.id}
                className="text-white hover:text-yellow-300 transition"
              >
                {book.name}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Ethiopian Orthodox Specific Books */}
        <h2 className="text-2xl font-semibold text-yellow-400 mb-4 text-center">Ethiopian Orthodox Canon</h2>
        
        {/* Two columns layout for deuterocanonical and Ethiopian books */}
        <div className="grid gap-8 md:grid-cols-2 mb-8">
          {/* Deuterocanonical Books */}
          <div className="bg-[#043a26] rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Deuterocanonical Books</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
              {deuterocanonical.length > 0 ? deuterocanonical.map((book) => (
                <Link 
                  href={`/bible/${book.slug}`} 
                  key={book.id}
                  className="text-white hover:text-yellow-300 transition"
                >
                  {book.name}
                </Link>
              )) : (
                <p className="text-gray-300 col-span-2">Loading deuterocanonical texts...</p>
              )}
            </div>
          </div>

          {/* Ethiopian Books */}
          <div className="bg-[#043a26] rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Uniquely Ethiopian</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
              {ethiopian.length > 0 ? ethiopian.map((book) => (
                <Link 
                  href={`/bible/${book.slug}`} 
                  key={book.id}
                  className="text-white hover:text-yellow-300 transition"
                >
                  {book.name}
                </Link>
              )) : (
                <p className="text-gray-300 col-span-2">Loading Ethiopian texts...</p>
              )}
            </div>
          </div>
        </div>

        {/* Other Related Texts */}
        <div className="bg-[#043a26] rounded-lg shadow-xl p-6 mb-10">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">Other Related Texts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4">
            {otherTexts.length > 0 ? otherTexts.map((book) => (
              <Link 
                href={`/bible/${book.slug}`} 
                key={book.id}
                className="text-white hover:text-yellow-300 transition"
              >
                {book.name}
              </Link>
            )) : (
              <p className="text-gray-300 col-span-4">Loading other texts...</p>
            )}
          </div>
        </div>

        {/* Bible reading tips */}
        <div className="mt-8 bg-[#043a26] rounded-lg shadow-xl p-6 text-center">
          <h3 className="text-xl font-semibold text-yellow-400 mb-3">Bible Reading Tips</h3>
          <p className="text-gray-300 mb-4">
            Take your time to read and reflect on God's Word. 
            Consider reading a chapter each day as part of your spiritual journey.
          </p>
        </div>
      </div>
    </div>
  );
}
