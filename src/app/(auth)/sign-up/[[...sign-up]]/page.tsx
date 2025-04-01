"use client"

import { SignUp } from "@clerk/nextjs";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";
import DisclaimerModal from '@/app/_components/DisclaimerModal';

const SignUpPage = () => {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  // Redirect to home page if already signed in
  React.useEffect(() => {
    if (isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true);
    setShowDisclaimer(false);
  };

  const handleDeclineTerms = () => {
    // Redirect to homepage if user declines terms
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#086c47]">
      {/* Disclaimer Modal */}
      <DisclaimerModal 
        isOpen={showDisclaimer}
        onAccept={handleAcceptTerms}
        onCancel={handleDeclineTerms}
      />

      {/* Only show sign up form after accepting disclaimer */}
      {!showDisclaimer && hasAcceptedTerms && (
        <div className="bg-[#ffb43cc1] p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Sign Up to Kidist Selassie Youth International Network</h2>
          <p className="text-center text-gray-600 mb-6">Create your account to join our community</p>
          
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-[#086c47] hover:bg-[#064d32]',
                card: 'bg-transparent shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'bg-white text-black border border-gray-300 hover:bg-gray-50'
              }
            }}
            redirectUrl="/"
          />
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
