// File: /app/api/verses/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;
    
    console.log('Received password verification request');
    
    if (!password) {
      console.log('Password verification failed: No password provided');
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
    // Check if environment variable exists
    if (!process.env.VERSE_PASSWORD) {
      console.error('VERSE_PASSWORD environment variable is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    // Check if the password matches the one in the environment variable
    if (password !== process.env.VERSE_PASSWORD) {
      console.log('Password verification failed: Incorrect password');
      return NextResponse.json({ error: 'Unauthorized - Incorrect password' }, { status: 401 });
    }
    
    // If the password is correct, return success
    console.log('Password verification successful');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json({ error: 'Server error processing request' }, { status: 500 });
  }
}
