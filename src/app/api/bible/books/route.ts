import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Using PrismaClient to fetch books
    const books = await prisma.book.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        chapters: true,
      },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching Bible books:', error);
    return NextResponse.json(
      { message: 'Failed to fetch Bible books' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
