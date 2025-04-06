import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;
    
    console.log('Verify endpoint received password attempt');
    
    // Check if the provided password matches the environment variable or fallback
    const adminPassword = 'Youth100%'; // Hardcode for now to debug
    
    console.log('Comparing password:', password === adminPassword);
    
    if (password === adminPassword) {
      console.log('Password verified successfully');
      return NextResponse.json({ success: true });
    } else {
      console.log('Password verification failed');
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error in admin verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
