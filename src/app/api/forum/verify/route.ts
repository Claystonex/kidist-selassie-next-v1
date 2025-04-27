import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Verifying admin password');
    const body = await request.json();
    const { password } = body;
    
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
    // Compare with environment variable
    if (password === process.env.VERSE_PASSWORD) {
      console.log('Password verification successful');
      return NextResponse.json({ authenticated: true });
    } else {
      console.log('Password verification failed');
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Error verifying password:', error?.message || error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
