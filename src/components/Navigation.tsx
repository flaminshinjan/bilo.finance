"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="py-4 px-4">
      <div className="max-w-[1200px] mx-auto flex items-center">
        <div className="flex items-center relative w-[120px]">
          <Image
            src="/bilo-logo.png"
            alt="Bilo Logo"
            width={120}
            height={48}
          />
          <div className="hidden sm:block absolute -top-1 -right-16 px-2 py-0.5 rounded-full border border-[#FBB03B] text-[#FBB03B] text-[10px] whitespace-nowrap">
            we're hiring !
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden ml-auto p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="w-6 h-0.5 bg-black mb-1"></div>
          <div className="w-6 h-0.5 bg-black mb-1"></div>
          <div className="w-6 h-0.5 bg-black"></div>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-12 mx-auto">
          <Link href="/" className="nav-link active">
            Home
          </Link>
          <Link href="/about" className="nav-link">
            About Us
          </Link>
        </div>

        {/* Try Demo Button */}
        <div className="hidden md:block w-[120px] text-right">
          <Link href="/demo" className="btn-primary">
            Try Demo
          </Link>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-[72px] left-0 right-0 bg-white shadow-lg p-4 flex flex-col items-center gap-4 md:hidden">
            <div className="sm:hidden px-2 py-0.5 rounded-full border border-[#FBB03B] text-[#FBB03B] text-[10px]">
              we're hiring !
            </div>
            <Link href="/" className="nav-link active">
              Home
            </Link>
            <Link href="/about" className="nav-link">
              About Us
            </Link>
            <Link href="/demo" className="btn-primary w-full text-center">
              Try Demo
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}; 