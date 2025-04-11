import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicPaths = [
  '/',
  '/sign-in',
  '/sign-up',
  '/api/webhooks/clerk',
  '/api/verses',
  '/api/forum',
  '/api/debug',
  '/api/translate',
  '/api/email',
  '/api/jokes',
  '/favicon.ico',
  '/admin', // Admin routes use their own password protection
];

export function middleware(req: NextRequest) {
  // Check if the path is public
  const { pathname } = req.nextUrl;
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get auth state
  const { userId } = getAuth(req);

  // If not authenticated, redirect to sign-in
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Skip onboarding check for certain routes
  if (pathname.startsWith('/onboarding')) {
    return NextResponse.next();
  }

  // Check for onboarding completion
  const onboardingCookie = req.cookies.get('onboarding_complete');
  if (!onboardingCookie || onboardingCookie.value !== 'true') {
    // Redirect to onboarding page
    const onboardingUrl = new URL('/onboarding', req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  return NextResponse.next();
}

// Configure the middleware matcher
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|static|assets).*)',
    '/(api|trpc)(.*)',
  ],
};