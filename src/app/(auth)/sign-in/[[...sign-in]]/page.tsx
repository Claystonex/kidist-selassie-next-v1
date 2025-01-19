"use client"

import { SignIn } from "@clerk/nextjs";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";

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
    <div className="min-h-screen flex items-center justify-center bg-[#086c47]">
      <div className="bg-[#ffb43cac] p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In to Kidist Selassie Youth International Network</h2>
        <p className="text-center text-gray-600 mb-6">Welcome back! Please sign in to continue</p>
        
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-[#086c47] hover:bg-[#064d32]',
              card: 'bg-transparent shadow-none',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'bg-white text-black border border-gray-300 hover:bg-gray-50'
            }
          }}
          redirectUrl="/dashboard"
        />
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/sign-up" className="text-green-600 hover:text-green-700">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;