"use client"

import { SignUp } from "@clerk/nextjs";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";
import dynamic from 'next/dynamic';

// Dynamically import the banner to avoid SSR issues with animations
const GrandOpeningBanner = dynamic(
  () => import('@/app/_components/GrandOpeningBanner'),
  { ssr: false }
);
const GrandOpeningTwoBanner = dynamic(
  () => import('@/app/_components/GrandOpeningTwoBanner'),
  { ssr: false }
);

const SignUpPage = () => {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [redirectUrl, setRedirectUrl] = React.useState('/');

  // Get redirect URL from query parameters if available
  React.useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get('redirect_url');
      if (redirectParam) {
        setRedirectUrl(redirectParam);
      }
    }
  }, []);

  // Redirect to home page if already signed in
  React.useEffect(() => {
    if (isSignedIn) {
      router.push(redirectUrl);
    }
  }, [isSignedIn, router, redirectUrl]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#086c47]">
      {/* Banner at the top (non-sticky) */}
      <div className="w-full mb-16">
        <GrandOpeningBanner />
      </div>
      
      {/* Sign up form */}
      <div className="mt-6 w-full max-w-md flex flex-col items-center mb-2">
        <div className="bg-[#edcf08] p-8 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-bold text-center">Sign Up for Kidist Selassie Youth International Network</h2>
          <p className="text-center text-gray-600 mb-6">Join our community today!</p>
        
          <style jsx global>{`
            /* Completely remove all Clerk development mode elements */
            .cl-development-mode-badge,
            .cl-development-mode-container,
            .cl-footer,
            .cl-footerAction,
            .cl-footerText,
            .cl-internal-f59g3p,
            div[data-localization-key="userProfile.developmentMode"],
            a[href="https://dashboard.clerk.com"] {
              display: none !important;
              visibility: hidden !important;
              height: 0 !important;
              width: 0 !important;
              opacity: 0 !important;
              overflow: hidden !important;
              position: absolute !important;
              pointer-events: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            /* Force remove any bottom element */
            .cl-card::after {
              display: none !important;
            }
          `}</style>
          
          <div className="clerk-wrapper" style={{ position: 'relative' }}>
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-[#086c47] hover:bg-[#064d32] w-full py-3',
                  card: 'bg-transparent shadow-none',
                  headerTitle: 'shadow-none',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'bg-white text-black border border-gray-300 hover:bg-gray-50',
                  footerAction: 'hidden',
                  footer: 'hidden',
                }
              }}
              redirectUrl={redirectUrl}
            />
            
            {/* Sign in link */}
            <div className="mt-6 text-center">
              <p className="text-gray-700">
                Already have an account?{' '}
                <a href="/sign-in" className="text-[#086c47] hover:text-[#064d32] font-semibold transition-colors duration-300">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom banner */}
      <div className="w-full">
        <GrandOpeningTwoBanner />
      </div>
    </div>
  );
};

export default SignUpPage;
