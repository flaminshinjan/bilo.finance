'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiUsers, FiDollarSign, FiFileText, FiSettings, FiLogOut, FiHome, FiBarChart, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';

interface CompanyAuthData {
  email: string;
  role: string;
  loginTime: string;
}

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [companyAuth, setCompanyAuth] = useState<CompanyAuthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for company authentication
    const authData = localStorage.getItem('companyAuth');
    if (authData) {
      try {
        const parsedAuth = JSON.parse(authData);
        setCompanyAuth(parsedAuth);
      } catch (error) {
        console.error('Error parsing company auth data:', error);
        router.push('/company/login');
      }
    } else {
      router.push('/company/login');
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('companyAuth');
    router.push('/company/login');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/company/dashboard',
      icon: FiHome,
    },
    {
      name: 'Reimbursements',
      href: '/company/dashboard/reimbursements',
      icon: FiDollarSign,
    },
    {
      name: 'Employees',
      href: '/company/dashboard/employees',
      icon: FiUsers,
    },
    {
      name: 'Reports',
      href: '/company/dashboard/reports',
      icon: FiBarChart,
    },
    {
      name: 'Settings',
      href: '/company/dashboard/settings',
      icon: FiSettings,
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6B7280] border-t-transparent"></div>
      </div>
    );
  }

  if (!companyAuth) {
    return null;
  }

  return (
    <div className="h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] flex overflow-hidden">
      {/* Floating Sidebar */}
      <div className="fixed top-4 left-4 h-[calc(100vh-2rem)] w-64 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-[#E5E7EB] dark:border-[#333333] flex flex-col z-30">
        {/* Logo */}
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#333333] flex-shrink-0">
          <div className="flex flex-col items-start">
            <Image
              src="/bilo-logo.png"
              alt="Bilo Logo"
              width={120}
              height={40}
              className="mb-3"
            />
            <div className="text-left">
              <h1 className="text-sm font-bold text-[#1F2937] dark:text-white">Admin Dashboard</h1>
              
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#1F2937] to-[#374151] dark:from-[#333333] dark:to-[#404040] text-white shadow-lg'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:bg-gradient-to-r hover:from-[#F3F4F6] hover:to-[#E5E7EB] dark:hover:from-[#333333] dark:hover:to-[#404040] hover:text-[#1F2937] dark:hover:text-white hover:shadow-md'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform duration-200'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t border-[#E5E7EB] dark:border-[#333333] flex-shrink-0">
          <div className="bg-gradient-to-r from-[#F8F9FA] to-[#F3F4F6] dark:from-[#333333] dark:to-[#2a2a2a] rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-gradient-to-r from-[#1F2937] to-[#374151] dark:from-[#555555] dark:to-[#666666] rounded-full p-2">
                <FiHome className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1F2937] dark:text-white truncate">
                  {companyAuth.email}
                </p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  Admin User
                </p>
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="mb-4">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center space-x-3 w-full px-3 py-3 text-sm font-medium text-[#1F2937] dark:text-white bg-[#F3F4F6] dark:bg-[#333333] hover:bg-[#E5E7EB] dark:hover:bg-[#444444] rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <FiMoon className="w-5 h-5" />
              ) : (
                <FiSun className="w-5 h-5" />
              )}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-3 w-full px-3 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-72">
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 