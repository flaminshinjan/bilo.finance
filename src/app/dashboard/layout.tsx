'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }
        setUser(user);
      } catch (error) {
        console.error('Error checking auth status:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      setError('');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.clear();
      router.push('/auth/login');
    } catch (error: any) {
      setError(error.message || 'Error signing out');
      console.error('Error signing out:', error);
    } finally {
      setSigningOut(false);
    }
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Image
                  src="/bilo-logo.png"
                  alt="Bilo Logo"
                  width={100}
                  height={40}
                  className="cursor-pointer"
                />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <span className="sr-only">Open main menu</span>
                <div className="block w-6 space-y-1">
                  <span className={`block h-0.5 w-6 bg-current transform transition duration-500 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                  <span className={`block h-0.5 w-6 bg-current transition duration-500 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`block h-0.5 w-6 bg-current transform transition duration-500 ease-in-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                </div>
              </button>
            </div>

            <div className="hidden md:flex items-center">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user?.email}
                </span>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className={`text-sm text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${error ? 'text-red-600' : ''}`}
                >
                  {signingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-700 mr-2"></div>
                      Signing out...
                    </>
                  ) : (
                    'Sign out'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="pt-2 pb-3 space-y-1">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/dashboard/invoices">Invoices</NavLink>
              <NavLink href="/dashboard/settings">Settings</NavLink>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <span className="text-sm font-medium text-gray-700">{user?.email}</span>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {signingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-800 text-sm p-2 rounded-md mb-2">
              {error}
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar and Main Content */}
      <div className="flex">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:block w-64 bg-white shadow-sm h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/dashboard/invoices">Invoices</NavLink>
            <NavLink href="/dashboard/settings">Settings</NavLink>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 