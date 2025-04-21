import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;
    
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
    // Compare with environment variable
    if (password === process.env.VERSE_PASSWORD) {
      return NextResponse.json({ authenticated: true });
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
