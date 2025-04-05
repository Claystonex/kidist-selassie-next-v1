import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes
const publicRoutes = [
  '/sign-in',
  '/sign-up',
  '/api/webhooks/clerk',
];

// Define routes that don't need onboarding check
const bypassOnboardingRoutes = [
  '/onboarding',
  '/api',
  '/_next',
  '/static',
  '/favicon.ico',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes to pass through
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Skip onboarding check for bypass routes
  if (bypassOnboardingRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Check for auth cookie
  const authCookie = request.cookies.get('__session');
  if (!authCookie) {
    // Not logged in, redirect to sign-in
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // Check for onboarding completion
  const onboardingCookie = request.cookies.get('onboarding_complete');
  if (!onboardingCookie || onboardingCookie.value !== 'true') {
    // Onboarding not complete, redirect to onboarding page
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}