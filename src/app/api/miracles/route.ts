import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;

    const miracle = await prisma.miracle.create({
      data: {
        title,
        description,
        userName: 'Anonymous', // TODO: Replace with actual user when auth is implemented
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json(miracle, { status: 201 });
  } catch (error) {
    console.error('Error creating miracle testimony:', error);
    return NextResponse.json(
      { error: 'Failed to create miracle testimony' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const miracles = await prisma.miracle.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    });

    return NextResponse.json(miracles);
  } catch (error) {
    console.error('Error fetching miracles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch miracle testimonies' },
      { status: 500 }
    );
  }
}
