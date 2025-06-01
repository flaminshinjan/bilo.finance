'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { FiMenu, FiX, FiUpload, FiFileText, FiDollarSign, FiSettings, FiSun, FiMoon, FiLogOut } from 'react-icons/fi';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: FiMenu },
    { href: '/dashboard/upload', label: 'Upload Invoice', icon: FiUpload },
    { href: '/dashboard/invoices', label: 'Invoices', icon: FiFileText },
    { href: '/dashboard/reimbursements', label: 'Reimbursements', icon: FiDollarSign },
    { href: '/dashboard/settings', label: 'Settings', icon: FiSettings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-theme={theme}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200" data-theme={theme}>
      {/* Floating Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 z-30
          ${isSidebarOpen ? 'w-72' : 'w-20'} 
          transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4">
            <Link href="/dashboard" className={`flex items-center ${!isSidebarOpen && 'lg:hidden'}`}>
              <Image
                src="/bilo-logo.png"
                alt="Bilo Logo"
                width={100}
                height={40}
                className="cursor-pointer"
              />
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              {isSidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-primary text-black dark:bg-primary/20 dark:text-primary' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <Icon className="w-5 h-5" />
                    {isSidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <FiLogOut className="w-5 h-5" />
                {isSidebarOpen && <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>}
              </button>
            </div>
            {isSidebarOpen && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main 
        className={`min-h-screen transition-all duration-200 ${
          isSidebarOpen ? 'lg:pl-72' : 'lg:pl-20'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <DashboardContent>{children}</DashboardContent>
    </ThemeProvider>
  );
} 