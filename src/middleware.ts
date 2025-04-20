import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Only allow unauthenticated access to these routes and static assets
const PUBLIC_PATHS = [
  '/sign-in',
  '/sign-up',
  '/favicon.ico',
  '/_next/static',
  '/_next/image',
  '/images',
  '/fonts',
  '/assets', // Allow static assets like the logo
  '/admin', // Admin pages have their own password protection
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((publicPath) => pathname.startsWith(publicPath));
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', '/');
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|fonts|assets).*)'],
};