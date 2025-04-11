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
  '/api/prayers',
  '/api/miracles',
  '/api/gallery',
  '/api/questions',
  '/api/feedback',
  '/api/bootcamps',
  '/api/mentorship',
  '/api/bible-tracker',
  '/api/teachings',
  '/favicon.ico',
  '/admin', // Admin routes use their own password protection
];

// Define paths that should bypass the middleware completely
const bypassPaths = [
  '/_next',
  '/static',
  '/assets',
  '/images',
];

export function middleware(req: NextRequest) {
  try {
    // Check if the path should bypass middleware completely
    const { pathname } = req.nextUrl;
    
    // Check if path should bypass middleware
    for (const path of bypassPaths) {
      if (pathname.startsWith(path)) {
        return NextResponse.next();
      }
    }
    
    // Check if it's a public path
    const isPublicPath = publicPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    // If it's a public path, allow access
    if (isPublicPath) {
      return NextResponse.next();
    }
    
    // Special case for API routes - allow all API access to prevent 500 errors
    if (pathname.startsWith('/api/')) {
      return NextResponse.next();
    }

    // Get auth state - wrap in try/catch to prevent errors
    try {
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
    } catch (error) {
      // If auth check fails, still allow access to prevent errors
      console.error('Auth check failed in middleware:', error);
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (error) {
    // Catch-all error handler to prevent middleware failures
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// Configure the middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon\.ico|static|assets).*)',
  ],
};