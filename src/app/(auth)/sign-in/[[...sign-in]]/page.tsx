"use client"

import { SignIn } from "@clerk/nextjs";
import React, { useState } from 'react';
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

const SignInPage = () => {
  const router = useRouter();
  const { isSignedIn } = useUser();

  // Redirect to dashboard if already signed in
  React.useEffect(() => {
    if (isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#086c47]">
      {/* Banner at the top (non-sticky) */}
      <div className="w-full mb-16">
        <GrandOpeningBanner />
      </div>
      
      {/* Sign-in content with about an inch of spacing from the banner */}
      <div className="mt-10 w-full max-w-md flex flex-col items-center mb-8">
        <div className="bg-[#edcf08] p-8 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-bold text-center">Sign In to Kidist Selassie Youth International Network</h2>
          <p className="text-center text-gray-600 mb-6">Welcome back! Please sign in to continue</p>
        
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
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-[#086c47] hover:bg-[#064d32]',
                  card: 'bg-transparent shadow-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'bg-white text-black border border-gray-300 hover:bg-gray-50',
                  footerAction: 'hidden',
                  footer: 'hidden',
                  rootBox: 'relative',
                }
              }}
              redirectUrl="/"
            />
            
            {/* Yellow placeholder for the space where development mode text was */}
            <div style={{
              height: '30px',
              width: '100%',
              backgroundColor: '#edcf08', /* Same yellow as the sign-in form background */
              borderRadius: '0 0 8px 8px',
              marginTop: '-5px' /* Overlap slightly to avoid any gap */
            }}></div>
          </div>

          
          
        </div>
      </div>
      <div className="w-full">
        <GrandOpeningTwoBanner />
      </div>
    </div>
  );
};

export default SignInPage;