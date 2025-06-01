"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from 'next/navigation';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide navigation in dashboard and auth routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/auth')) {
    return null;
  }

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link 
        href={href} 
        className={`relative py-2 text-gray-600 hover:text-gray-900 transition-colors ${isActive ? 'text-primary' : ''}`}
      >
        {children}
        {isActive && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <nav className="py-4 px-4">
      <div className="max-w-[1200px] mx-auto flex items-center">
        <div className="flex items-center relative w-[120px]">
          <Link href="/">
        <Image
          src="/bilo-logo.png"
          alt="Bilo Logo"
          width={120}
          height={48}
            />
          </Link>
          <div className="hidden sm:block absolute -top-1 -right-16 px-2 py-0.5 rounded-full border border-[#FBB03B] text-[#FBB03B] text-[10px] whitespace-nowrap">
            we&apos;re hiring !
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
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About Us</NavLink>
        </div>

        {/* Try Now Button */}
        <div className="hidden md:block">
          <Link 
            href="/auth/login" 
            className="bg-primary text-black px-6 py-2 rounded-full hover:bg-primary/80 transition-colors"
          >
            Try Now
          </Link>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-[72px] left-0 right-0 bg-white shadow-lg p-4 flex flex-col items-center gap-4 md:hidden z-50">
            <div className="sm:hidden px-2 py-0.5 rounded-full border border-[#FBB03B] text-[#FBB03B] text-[10px]">
              we&apos;re hiring !
      </div>
            <Link 
              href="/" 
              className={`nav-link relative py-2 ${pathname === '/' ? 'text-primary' : 'text-gray-600'}`}
              onClick={() => setIsMenuOpen(false)}
            >
          Home
              {pathname === '/' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
              )}
        </Link>
            <Link 
              href="/about" 
              className={`nav-link relative py-2 ${pathname === '/about' ? 'text-primary' : 'text-gray-600'}`}
              onClick={() => setIsMenuOpen(false)}
            >
          About Us
              {pathname === '/about' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
              )}
        </Link>
            <Link 
              href="/auth/login" 
              className="bg-primary text-black px-6 py-2 rounded-full hover:bg-primary/80 transition-colors w-full text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Try Now
        </Link>
          </div>
        )}
      </div>
    </nav>
  );
} 