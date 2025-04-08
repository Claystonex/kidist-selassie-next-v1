// File: /app/api/verses/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // First check if the request can be parsed as JSON
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body as JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { password } = body;
    
    console.log('Received password verification request');
    
    if (!password) {
      console.log('Password verification failed: No password provided');
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
    // Use hardcoded password for now
    const expectedPassword = 'Youth100';
    
    // Check if the password matches
    if (password !== expectedPassword) {
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
