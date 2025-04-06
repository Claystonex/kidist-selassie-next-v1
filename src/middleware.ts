import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/sign-in',
  '/sign-up',
  '/api/webhooks/clerk',
  '/_next',
  '/favicon.ico',
  '/static',
  '/admin', // Admin routes use their own password protection
];

// Define routes that don't need onboarding check
const bypassOnboardingRoutes = [
  '/onboarding',
  '/api',
];

// Export the middleware function
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes to pass through without auth check
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Check for auth session cookie
  const sessionCookie = request.cookies.get('__session');
  if (!sessionCookie) {
    // Not logged in, redirect to sign-up for new users
    const signUpUrl = new URL('/sign-up', request.url);
    return NextResponse.redirect(signUpUrl);
  }
  
  // Skip onboarding check for bypass routes
  if (bypassOnboardingRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Check for onboarding completion
  const onboardingCookie = request.cookies.get('onboarding_complete');
  if (!onboardingCookie || onboardingCookie.value !== 'true') {
    // Onboarding not complete, redirect to onboarding page
    const onboardingUrl = new URL('/onboarding', request.url);
    return NextResponse.redirect(onboardingUrl);
  }
  
  return NextResponse.next();
}

// Configure the middleware matcher with a simpler pattern
export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
};