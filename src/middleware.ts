// src/middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

// Use Clerk's middleware to protect routes and handle authentication
export default clerkMiddleware();

// Configure the middleware matcher to ensure it runs on all relevant routes
export const config = {
  matcher: [
    // Match all paths except static files, images, etc.
    '/((?!_next/static|_next/image|favicon\.ico|static|assets).*)',
    '/',
    '/(api|trpc)(.*)',  // Make sure API routes are included
  ],
};