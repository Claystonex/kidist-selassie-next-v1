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

// Group books by testament
function groupBooksByTestament(books: any[]) {
  // Define Old Testament and New Testament books
  const newTestamentBooks = [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
    '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
    'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
    'Jude', 'Revelation'
  ];
  
  return {
    oldTestament: books.filter(book => !newTestamentBooks.includes(book.name)),
    newTestament: books.filter(book => newTestamentBooks.includes(book.name)),
  };
}

export default async function BiblePage() {
  const books = await getBooks();
  const { oldTestament, newTestament } = groupBooksByTestament(books);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#064d32]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-4">Holy Bible</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Read and study the Word of God. Select a book below to begin reading.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Old Testament */}
          <div className="bg-[#043a26] rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Old Testament</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4">
              {oldTestament.map((book) => (
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
          <div className="bg-[#043a26] rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-4">New Testament</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4">
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
        </div>

        {/* Bible reading tips */}
        <div className="mt-12 bg-[#043a26] rounded-lg shadow-xl p-6 text-center">
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
