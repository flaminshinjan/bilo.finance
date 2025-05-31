'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function EmailConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <Image
            src="/logo.png"
            alt="bilo.app"
            fill
            className="object-contain"
          />
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Email confirmed!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Your email has been successfully verified. You can now sign in to your account.
          </p>

          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-black bg-primary hover:bg-primary/80 transition-colors duration-200"
          >
            Sign in to your account
          </Link>
        </div>
      </div>
    </div>
  );
} 