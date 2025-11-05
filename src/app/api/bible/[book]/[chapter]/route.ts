// @ts-nocheck
// Temporarily disable type checking here to avoid Prisma client type drift during migration/generation
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Fetch chapter details including verses and book info
async function getChapter(bookSlug: string, chapterNumber: number) {
  try {
    const chapter = await prisma.chapter.findFirst({
      where: {
        number: chapterNumber,
        book: { slug: bookSlug },
      },
      include: {
        verses: {
          orderBy: { number: 'asc' },
          select: {
            id: true,
            number: true,
            text: true,
            textAm: true,
            textEn: true,
            chapterId: true,
          },
        },
        book: true,
      },
    });
    
    return chapter;
  } catch (error) {
    console.error(`Error fetching chapter ${bookSlug} ${chapterNumber}:`, error);
    return null;
  }
}
export async function GET(
  request: Request,
  context: any
) {
  const params = context.params;
  try {
    const bookSlug = params.book;
    const chapterNumber = parseInt(params.chapter);
    
    const chapter = await getChapter(bookSlug, chapterNumber);
    
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(chapter);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
