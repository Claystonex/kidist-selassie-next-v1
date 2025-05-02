import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Log API requests in development to help debug
  if (process.env.NODE_ENV === 'development') {
    console.log(`API Request: ${request.method} ${request.nextUrl.pathname}`);
  }

  // Allow all API requests to proceed
  return NextResponse.next();
}

// Configure the middleware to only run on API routes
export const config = {
  matcher: '/api/:path*',
};
