import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// GET all suggestions
export async function GET() {
  try {
    const suggestions = await prisma.summerSuggestion.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(suggestions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}

// POST new suggestion
export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const suggestion = await prisma.summerSuggestion.create({
      data: {
        id: uuidv4(),
        content,
        createdAt: new Date(),
      },
    });

    return NextResponse.json(suggestion);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create suggestion' }, { status: 500 });
  }
}

// DELETE suggestion
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.summerSuggestion.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Suggestion deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete suggestion' }, { status: 500 });
  }
}
