'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { 
  FiMenu, 
  FiX, 
  FiUpload, 
  FiFileText, 
  FiDollarSign, 
  FiSettings, 
  FiSun, 
  FiMoon, 
  FiLogOut,
  FiHome,
  FiCreditCard,
  FiBarChart,
  FiPieChart,
  FiTrendingUp,
  FiUsers,
  FiZap,
  FiShield,
  FiHelpCircle,
  FiBookOpen,
  FiMail,
  FiGlobe,
  FiBell,
  FiDownload,
  FiArchive
} from 'react-icons/fi';

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

  const mainNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: FiHome },
    { href: '/dashboard/upload', label: 'Upload Invoice', icon: FiUpload },
    { href: '/dashboard/invoices', label: 'Invoices', icon: FiFileText },
    { href: '/dashboard/reimbursements', label: 'Reimbursements', icon: FiCreditCard },
  ];

  const analyticsNavItems = [
    { href: '/dashboard/analytics', label: 'Analytics', icon: FiBarChart },
    { href: '/dashboard/reports', label: 'Reports', icon: FiPieChart },
    { href: '/dashboard/insights', label: 'Insights', icon: FiTrendingUp },
  ];

  const managementNavItems = [
    { href: '/dashboard/users', label: 'User Management', icon: FiUsers },
    { href: '/dashboard/integrations', label: 'Integrations', icon: FiZap },
    { href: '/dashboard/security', label: 'Security', icon: FiShield },
    { href: '/dashboard/notifications', label: 'Notifications', icon: FiBell },
  ];

  const resourcesNavItems = [
    { href: '/dashboard/help', label: 'Help Center', icon: FiHelpCircle },
    { href: '/dashboard/documentation', label: 'Documentation', icon: FiBookOpen },
    { href: '/dashboard/support', label: 'Contact Support', icon: FiMail },
    { href: '/dashboard/archive', label: 'Archive', icon: FiArchive },
  ];

  const otherNavItems = [
    { href: '/dashboard/settings', label: 'Settings', icon: FiSettings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F23]" data-theme={theme}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#8B5CF6] border-t-transparent"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0F0F23] transition-all duration-200" data-theme={theme}>
      {/* Modern Floating Sidebar */}
      <aside 
        className={`fixed top-4 left-4 h-[calc(100vh-2rem)] bg-[#1A1A2E] shadow-2xl transition-all duration-300 z-30 rounded-3xl border border-gray-800/50
          ${isSidebarOpen ? 'w-[280px]' : 'w-20'} 
          transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
            <Link href="/dashboard" className={`flex items-center transition-opacity duration-200 ${!isSidebarOpen && 'lg:opacity-0 lg:pointer-events-none'}`}>
              <Image
                src="/bilo-logo.png"
                alt="Bilo Logo"
                width={120}
                height={40}
                className="cursor-pointer"
              />
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all duration-200 lg:hidden"
            >
              {isSidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-6">
            {/* Main Section */}
            <div className="space-y-2">
              {isSidebarOpen && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  MAIN
                </h3>
              )}
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group
                      ${isActive 
                        ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20' 
                        : 'text-[#9CA3AF] hover:bg-[#8B5CF6]/10 hover:text-white'}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#9CA3AF] group-hover:text-white'}`} />
                    {isSidebarOpen && (
                      <span className={`font-medium transition-colors duration-200 ${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Analytics Section */}
            <div className="space-y-2 mt-8">
              {isSidebarOpen && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  ANALYTICS
                </h3>
              )}
              {analyticsNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group
                      ${isActive 
                        ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20' 
                        : 'text-[#9CA3AF] hover:bg-[#8B5CF6]/10 hover:text-white'}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#9CA3AF] group-hover:text-white'}`} />
                    {isSidebarOpen && (
                      <span className={`font-medium transition-colors duration-200 ${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Management Section */}
            <div className="space-y-2 mt-8">
              {isSidebarOpen && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  MANAGEMENT
                </h3>
              )}
              {managementNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group
                      ${isActive 
                        ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20' 
                        : 'text-[#9CA3AF] hover:bg-[#8B5CF6]/10 hover:text-white'}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#9CA3AF] group-hover:text-white'}`} />
                    {isSidebarOpen && (
                      <span className={`font-medium transition-colors duration-200 ${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Resources Section */}
            <div className="space-y-2 mt-8">
              {isSidebarOpen && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  RESOURCES
                </h3>
              )}
              {resourcesNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group
                      ${isActive 
                        ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20' 
                        : 'text-[#9CA3AF] hover:bg-[#8B5CF6]/10 hover:text-white'}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#9CA3AF] group-hover:text-white'}`} />
                    {isSidebarOpen && (
                      <span className={`font-medium transition-colors duration-200 ${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Other Section */}
            <div className="space-y-2 mt-8">
              {isSidebarOpen && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  OTHERS
                </h3>
              )}
              {otherNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group
                      ${isActive 
                        ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20' 
                        : 'text-[#9CA3AF] hover:bg-[#8B5CF6]/10 hover:text-white'}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#9CA3AF] group-hover:text-white'}`} />
                    {isSidebarOpen && (
                      <span className={`font-medium transition-colors duration-200 ${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="p-6 border-t border-gray-800/50">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all duration-200"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors duration-200 p-2 rounded-xl hover:bg-red-500/10"
                title="Sign out"
              >
                <FiLogOut className="w-5 h-5" />
                {isSidebarOpen && !signingOut && <span className="text-sm">Sign out</span>}
                {isSidebarOpen && signingOut && <span className="text-sm">Signing out...</span>}
              </button>
            </div>
            {isSidebarOpen && user && (
              <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                <div className="text-sm text-white font-medium truncate">
                  {user.email}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Account Settings
                </div>
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
          isSidebarOpen ? 'lg:pl-[296px]' : 'lg:pl-[112px]'
        }`}
      >
        {/* Header */}
        <header className="bg-white dark:bg-[#1A1A2E] border-b border-gray-200 dark:border-gray-800 h-20 flex items-center justify-between px-6 lg:px-8 ml-0 lg:ml-4 rounded-none lg:rounded-t-2xl lg:mt-4 lg:mr-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              <FiMenu className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {/* You can add header actions here */}
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-8 max-w-7xl mx-auto lg:mr-4">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-400">
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