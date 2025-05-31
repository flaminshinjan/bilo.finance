'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="w-full py-20 px-4">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Invoicing?</h2>
          <p className="text-gray-600 text-lg mb-8">
            Join us in revolutionizing the way businesses handle their finances.
          </p>
          <Link 
            href="/auth/signup" 
            className="bg-primary text-black px-8 py-3 rounded-full text-lg font-medium hover:bg-primary/90 transition-colors inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </footer>
  );
} 