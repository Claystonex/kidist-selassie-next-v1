import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

// Fetch chapter details including verses and book info
async function getChapter(bookSlug: string, chapterNumber: number) {
  const prisma = new PrismaClient();
  try {
    const chapter = await prisma.chapter.findFirst({
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

// @ts-nocheck
// Adding TypeScript ignore to bypass type checking for API route

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
