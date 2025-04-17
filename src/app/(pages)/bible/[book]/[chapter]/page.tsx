import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// Define types for page props
type PageProps = {
  params: {
    book: string;
    chapter: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

// Dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const bookSlug = params.book;
  const chapterNumber = parseInt(params.chapter);
  const chapterData = await getChapter(bookSlug, chapterNumber);
  if (!chapterData) return { title: 'Chapter Not Found' };
  
  return {
    title: `${chapterData.book.name} ${chapterData.number} | Bible | Kidist Selassie Youth International Network`,
    description: `Read ${chapterData.book.name} Chapter ${chapterData.number} - Kidist Selassie Youth International Network`,
  };
}

// Define types for our returned data
interface Verse {
  id: number;
  number: number;
  text: string;
  chapterId: number;
}

interface Book {
  id: number;
  name: string;
  slug: string;
}

interface Chapter {
  id: number;
  number: number;
  bookId: number;
  book: Book;
  verses: Verse[];
}

// Fetch chapter details including verses and book info
async function getChapter(bookSlug: string, chapterNumber: number): Promise<Chapter | null> {
  const prisma = new PrismaClient();
  try {
    // Using PrismaClient type workaround
    const chapter = await (prisma as any).chapter.findFirst({
      where: {
        number: chapterNumber,
        book: { slug: bookSlug },
      },
      include: {
        verses: {
          orderBy: { number: 'asc' },
        },
        book: true,
      },
    });
    
    return chapter;
  } catch (error) {
    console.error(`Error fetching chapter ${bookSlug} ${chapterNumber}:`, error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

interface ChapterInfo {
  number: number;
}

interface BookWithChapters extends Book {
  chapters: ChapterInfo[];
}

interface NavigationItem {
  book: string;
  bookName: string;
  chapter: number;
}

interface NavigationResult {
  prev: NavigationItem | null;
  next: NavigationItem | null;
}

// Find the next and previous chapters
async function getNavigation(bookSlug: string, chapterNumber: number): Promise<NavigationResult> {
  const prisma = new PrismaClient();
  try {
    // Get current book
    const currentBook = await (prisma as any).book.findUnique({
      where: { slug: bookSlug },
      include: {
        chapters: {
          orderBy: { number: 'asc' },
          select: { number: true },
        },
      },
    }) as BookWithChapters | null;
    
    if (!currentBook) return { prev: null, next: null };
    
    const maxChapter = Math.max(...currentBook.chapters.map((c: ChapterInfo) => c.number));
    
    // Previous chapter logic
    let prev: NavigationItem | null = null;
    if (chapterNumber > 1) {
      // Previous chapter in same book
      prev = {
        book: currentBook.slug,
        bookName: currentBook.name,
        chapter: chapterNumber - 1,
      };
    } else {
      // Look for previous book
      const prevBook = await (prisma as any).book.findFirst({
        where: { id: { lt: currentBook.id } },
        orderBy: { id: 'desc' },
        include: {
          chapters: {
            orderBy: { number: 'desc' },
            take: 1,
          },
        },
      });
      
      if (prevBook && prevBook.chapters.length > 0) {
        prev = {
          book: prevBook.slug,
          bookName: prevBook.name,
          chapter: prevBook.chapters[0].number,
        };
      }
    }
    
    // Next chapter logic
    let next: NavigationItem | null = null;
    if (chapterNumber < maxChapter) {
      // Next chapter in same book
      next = {
        book: currentBook.slug,
        bookName: currentBook.name,
        chapter: chapterNumber + 1,
      };
    } else {
      // Look for next book
      const nextBook = await (prisma as any).book.findFirst({
        where: { id: { gt: currentBook.id } },
        orderBy: { id: 'asc' },
        include: {
          chapters: {
            orderBy: { number: 'asc' },
            take: 1,
          },
        },
      });
      
      if (nextBook && nextBook.chapters.length > 0) {
        next = {
          book: nextBook.slug,
          bookName: nextBook.name,
          chapter: nextBook.chapters[0].number,
        };
      }
    }
    
    return { prev, next };
  } catch (error) {
    console.error('Error finding navigation:', error);
    return { prev: null, next: null };
  } finally {
    await prisma.$disconnect();
  }
}

export default async function ChapterPage({ params }: PageProps) {
  // Correctly await params to satisfy Next.js dynamic route requirements
  const bookSlug = params.book;
  const chapterNumber = parseInt(params.chapter);
  const chapter = await getChapter(bookSlug, chapterNumber);
  
  if (!chapter) {
    notFound();
  }
  
  const { prev, next } = await getNavigation(bookSlug, chapterNumber);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#064d32]">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href={`/bible/${params.book}`} className="text-yellow-400 hover:text-yellow-300 transition">
            ← Back to {chapter.book.name}
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-2">
            {chapter.book.name} {chapter.number}
          </h1>
        </div>

        <div className="bg-[#043a26] rounded-lg shadow-xl p-6 mb-8">
          <div className="space-y-4 text-white">
            {chapter.verses.map((verse: Verse) => (
              <p key={verse.id} className="leading-relaxed">
                <span className="font-bold text-yellow-400 mr-2">{verse.number}</span>
                {verse.text}
              </p>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {prev ? (
            <Link
              href={`/bible/${prev.book}/${prev.chapter}`}
              className="px-4 py-2 bg-[#043a26] hover:bg-[#032a1b] text-white rounded transition"
            >
              ← {prev.bookName !== chapter.book.name ? `${prev.bookName} ` : ''}
              {prev.chapter}
            </Link>
          ) : (
            <div></div>
          )}

          <Link
            href={`/bible/${params.book}`}
            className="px-4 py-2 bg-[#043a26] hover:bg-[#032a1b] text-white rounded transition"
          >
            All Chapters
          </Link>

          {next ? (
            <Link
              href={`/bible/${next.book}/${next.chapter}`}
              className="px-4 py-2 bg-[#043a26] hover:bg-[#032a1b] text-white rounded transition"
            >
              {next.bookName !== chapter.book.name ? `${next.bookName} ` : ''}
              {next.chapter} →
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
