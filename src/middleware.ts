import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const PUBLIC_PATHS = [
  '/sign-in',
  '/sign-up',
  '/favicon.ico',
  '/_next/static',
  '/_next/image',
  '/images',
  '/fonts',
  '/assets'
];

// Function to check if a path is public
function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((publicPath) => pathname.startsWith(publicPath));
}

// Export the middleware with clerkMiddleware
export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;
  
  // Check if the request is for a public path
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // For all other paths, check authentication
  const { userId } = await auth();
  
  // If user is not authenticated, redirect to sign-in
  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // User is authenticated, allow access
  return NextResponse.next();
});

// Configure which routes middleware will run on
export const config = {
  matcher: [
    // Match the root path explicitly (homepage)
    '/',
    // Match all paths except Next.js static assets
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
    // Make sure API routes are included
    '/api/(.*)'
  ],
};
