"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme, isLandingPage } = useTheme();

  // Hide navigation in dashboard, auth, company routes, and user type selection
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/auth') || pathname.startsWith('/company') || pathname === '/select-user-type') {
    return null;
  }

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link 
        href={href} 
        className={`relative py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors ${isActive ? 'text-black dark:text-white' : ''}`}
      >
        {children}
        {isActive && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <nav className="py-4 px-4 bg-white dark:bg-black transition-colors duration-200">
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
          <div className="hidden sm:block absolute -top-1 -right-16 px-2 py-0.5 rounded-full border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-[10px] whitespace-nowrap">
            we&apos;re hiring !
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden ml-auto p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="w-6 h-0.5 bg-black dark:bg-white mb-1"></div>
          <div className="w-6 h-0.5 bg-black dark:bg-white mb-1"></div>
          <div className="w-6 h-0.5 bg-black dark:bg-white"></div>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-12 mx-auto">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About Us</NavLink>
        </div>

        {/* Theme Toggle & Try Now Button */}
        <div className="hidden md:flex items-center space-x-4">
          {!isLandingPage && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <FiMoon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <FiSun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          )}
          
          <Link 
            href="/select-user-type" 
            className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Try Now
          </Link>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-[72px] left-0 right-0 bg-white dark:bg-black shadow-lg border-t border-gray-200 dark:border-gray-800 p-4 flex flex-col items-center gap-4 md:hidden z-50">
            <div className="sm:hidden px-2 py-0.5 rounded-full border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-[10px]">
              we&apos;re hiring !
      </div>
            <Link 
              href="/" 
              className={`nav-link relative py-2 ${pathname === '/' ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
              onClick={() => setIsMenuOpen(false)}
            >
          Home
              {pathname === '/' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white rounded-full" />
              )}
        </Link>
            <Link 
              href="/about" 
              className={`nav-link relative py-2 ${pathname === '/about' ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
              onClick={() => setIsMenuOpen(false)}
            >
          About Us
              {pathname === '/about' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white rounded-full" />
              )}
        </Link>
            
            {!isLandingPage && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <FiMoon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                ) : (
                  <FiSun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            )}
            
            <Link 
              href="/select-user-type" 
              className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors w-full text-center"
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