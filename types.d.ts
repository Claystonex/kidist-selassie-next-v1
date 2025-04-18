// Override Next.js page props type definition
import { Metadata } from 'next';

declare global {
  // Override the PageProps interface for dynamic routes
  interface PageProps {
    params?: any;
    searchParams?: any;
  }

  // Add types for generateMetadata function
  interface GenerateMetadata {
    ({ params }: { params: any }): Promise<Metadata>;
  }
}

export {};
