import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes using createRouteMatcher for clarity and precision
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', // Matches /sign-in and /sign-in/*
  '/sign-up(.*)', // Matches /sign-up and /sign-up/*
  // Note: API routes like /api/jokes are NOT listed here, so they will be protected.
  '/favicon.ico',
  '/images/(.*)',
  '/fonts/(.*)',
  '/assets/(.*)',
  '/admin(.*)', // Admin pages might have their own auth, but can be public from Clerk's POV if needed
]);

export default clerkMiddleware((authInstance, req) => {
  // If the route is public, allow access without authentication.
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For any route that is not public, enforce authentication.
  // authInstance.protect() will:
  // - Redirect unauthenticated users to the sign-in page for page requests.
  // - Return a 401/403 error for API requests if unauthenticated.
  // - Do nothing and allow the request to proceed if the user is authenticated.
  authInstance.protect();
  
  // If authInstance.protect() does not throw or redirect, it means the user is authenticated.
  // Clerk's middleware will automatically call NextResponse.next() if no other response is returned.
});

export const config = {
  // Apply middleware to all routes except static files and Next.js internals
  // This ensures Clerk is active on API routes as well.
  matcher: ['/((?!.+\.[\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};