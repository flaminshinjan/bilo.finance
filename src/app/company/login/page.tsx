'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';

export default function CompanyLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/company/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store company session
        localStorage.setItem('companyAuth', JSON.stringify({
          id: data.company.id,
          email: data.company.email,
          companyName: data.company.company_name,
          role: 'admin',
          loginTime: new Date().toISOString()
        }));
        
        router.push('/company/dashboard');
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] flex transition-colors duration-200">
      {/* Left side - Simple Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1F2937] dark:bg-[#1a1a1a] relative">
        <div className="flex flex-col justify-center px-12 py-12 w-full">
          {/* Bilo Logo */}
          <div className="mb-12">
            <div className="bg-white rounded-xl p-4 shadow-lg inline-block mb-8">
              <Image
                src="/bilo-logo.png"
                alt="Bilo Logo"
                width={120}
                height={40}
                className="object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Company Portal
            </h1>
            <p className="text-xl text-gray-300">
              Access your admin dashboard to manage reimbursements and oversee financial operations.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative">
        {/* Back to Home Button */}
        <Link 
          href="/" 
          className="absolute top-8 left-8 inline-flex items-center space-x-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white transition-colors duration-200"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo and Header */}
          <div className="text-center mb-8">
            <div className="lg:hidden mb-6">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-3 shadow-lg inline-block border border-[#E5E7EB] dark:border-[#333333]">
                <Image
                  src="/bilo-logo.png"
                  alt="Bilo Logo"
                  width={100}
                  height={32}
                  className="object-contain"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#1F2937] dark:text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-[#6B7280] dark:text-[#9CA3AF]">
              Sign in to your company admin account
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg border border-[#E5E7EB] dark:border-[#333333] p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1F2937] dark:text-white mb-2">
                  Company Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-[#6B7280] dark:text-[#9CA3AF]" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-[#E5E7EB] dark:border-[#333333] rounded-lg bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                    placeholder="admin@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#1F2937] dark:text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-[#6B7280] dark:text-[#9CA3AF]" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-10 pr-10 py-3 border border-[#E5E7EB] dark:border-[#333333] rounded-lg bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-[#6B7280] dark:text-[#9CA3AF]" />
                    ) : (
                      <FiEye className="h-5 w-5 text-[#6B7280] dark:text-[#9CA3AF]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    href="/company/forgot-password"
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1F2937] dark:bg-white dark:text-[#1F2937] hover:bg-[#333333] dark:hover:bg-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white dark:border-[#1F2937] border-t-transparent mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in to Company Portal'
                )}
              </button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              Need a company account?{' '}
              <Link
                href="/company/signup"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
              >
                Contact sales
              </Link>
            </p>

            
          </div>
        </div>
      </div>
    </div>
  );
}
