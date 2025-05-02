// File: /app/api/gallery/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Add an OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET handler for testing API connectivity
export async function GET() {
  return NextResponse.json({
    status: 'Gallery verification API is working',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}

// Improved POST handler with better debugging
export async function POST(request: NextRequest) {
  console.log('Gallery verification request received');
  
  try {
    // Handle both FormData and JSON requests for flexibility
    let password = '';
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await request.json();
      password = body.password;
      console.log('JSON request received');
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      password = formData.get('password') as string;
      console.log('Form data request received');
    } else {
      console.log(`Unsupported content type: ${contentType}`);
    }
    
    if (!password) {
      console.log('Missing password in request');
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
    console.log('Checking password against env var');
    // Check if the password matches the one in the environment variable
    if (password !== process.env.VERSE_PASSWORD) {
      console.log('Unauthorized - password mismatch');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Authentication successful');
    // If the password is correct, return success
    return NextResponse.json({ success: true, message: 'Authenticated successfully' });
  } catch (error) {
    console.error('Gallery verification error:', error);
    return NextResponse.json({ error: 'Server error', details: String(error) }, { status: 500 });
  }
}
