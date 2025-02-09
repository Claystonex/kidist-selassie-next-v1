import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, isPrivate } = body;

    const prayer = await prisma.prayer.create({
      data: {
        title,
        description,
        isPrivate,
        userName: 'Anonymous', // TODO: Replace with actual user when auth is implemented
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json(prayer, { status: 201 });
  } catch (error) {
    console.error('Error creating prayer:', error);
    return NextResponse.json(
      { error: 'Failed to create prayer request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const prayers = await prisma.prayer.findMany({
      where: {
        isPrivate: false,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return NextResponse.json(prayers);
  } catch (error) {
    console.error('Error fetching prayers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prayer requests' },
      { status: 500 }
    );
  }
}
