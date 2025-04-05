'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import TranslatableText from '@/app/_components/TranslatableText';

export default function OnboardingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Check if user is already onboarded
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Check for existing values from user metadata
      const userMetadata = user.publicMetadata as Record<string, unknown> | undefined;
      
      if (userMetadata && userMetadata.onboardingComplete === true) {
        // User has already completed onboarding, redirect to home
        router.push('/');
        return;
      }
      
      // Pre-fill fields if available
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      
      // Check if phone number already exists
      if (user.phoneNumbers && user.phoneNumbers.length > 0) {
        setPhoneNumber(user.phoneNumbers[0]?.phoneNumber || '');
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    if (!firstName || !lastName || !phoneNumber) {
      setError('Please fill in all required fields.');
      return;
    }
    
    // Validate phone number format (simple validation)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
      setError('Please enter a valid phone number.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update user data in Clerk
      if (user) {
        // Update first and last name in Clerk
        await user.update({
          firstName,
          lastName,
        });
        
        // Add phone number if not already present
        if (!user.phoneNumbers || user.phoneNumbers.length === 0) {
          // Note: This might require additional verification depending on your Clerk settings
          try {
            await user.createPhoneNumber({ phoneNumber });
          } catch (phoneError) {
            console.error('Error adding phone number:', phoneError);
            setError('Failed to add phone number. Please try again.');
            setIsSubmitting(false);
            return;
          }
        }
        
        // Save additional data via Clerk's metadata API
        try {
          await user.update({
            unsafeMetadata: {
              ...user.unsafeMetadata,
              nickname: nickname || undefined,
              onboardingComplete: true,
              onboardingTimestamp: new Date().toISOString(),
            },
          });
        } catch (metadataError) {
          console.error('Error updating user metadata:', metadataError);
        }
        
        // Save data to our backend
        const response = await fetch('/api/user/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName,
            lastName,
            nickname,
            phoneNumber,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save user data');
        }
        
        // Set onboarding as complete
        setOnboardingComplete(true);
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error in onboarding:', error);
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state when checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#086c47] to-[#064e33] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-xl p-8">
        {onboardingComplete ? (
          <div className="text-center">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              <TranslatableText>Thank You!</TranslatableText>
            </h2>
            <p className="text-gray-600 mb-4">
              <TranslatableText>Your profile has been completed successfully. You will be redirected to the home page.</TranslatableText>
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              <TranslatableText>Complete Your Profile</TranslatableText>
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  <TranslatableText>First Name</TranslatableText> <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#086c47] focus:border-[#086c47]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  <TranslatableText>Last Name</TranslatableText> <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#086c47] focus:border-[#086c47]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                  <TranslatableText>Nickname</TranslatableText> <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#086c47] focus:border-[#086c47]"
                />
                <p className="mt-1 text-sm text-gray-500">
                  <TranslatableText>If you prefer to be called by a different name</TranslatableText>
                </p>
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  <TranslatableText>Phone Number</TranslatableText> <span className="text-red-500">*</span>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#086c47] focus:border-[#086c47]"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  <TranslatableText>For important updates and announcements</TranslatableText>
                </p>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#086c47] hover:bg-[#064e33] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#086c47] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin inline-block h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                      <TranslatableText>Saving...</TranslatableText>
                    </>
                  ) : (
                    <TranslatableText>Complete Profile</TranslatableText>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
