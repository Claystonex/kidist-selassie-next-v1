"use client"

import { SignUp } from "@clerk/nextjs";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";

const SignUpPage = () => {
  const router = useRouter();
  const { isSignedIn } = useUser();

  // Redirect to dashboard if already signed in
  React.useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#086c47]">
      <div className="bg-[#ffb43cc1] p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up to Selassie Youth Int. Network</h2>
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
          redirectUrl="/dashboard"
        />
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a href="/sign-in" className="text-green-600 hover:text-green-700">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
