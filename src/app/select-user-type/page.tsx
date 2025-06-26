'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiUser, FiShield, FiArrowLeft } from 'react-icons/fi';

export default function SelectUserTypePage() {
  const [selectedType, setSelectedType] = useState<'employee' | 'admin' | null>(null);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] flex items-center justify-center px-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white transition-colors duration-200 mb-8"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/bilo-logo.png"
            alt="Bilo Logo"
            width={120}
            height={40}
            className="mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-[#1F2937] dark:text-white mb-2">
            Welcome to Bilo Finance
          </h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">
            Choose your account type to get started
          </p>
        </div>

        {/* User Type Selection */}
        <div className="space-y-4 mb-8">
          {/* Employee Option */}
          <button
            onClick={() => setSelectedType('employee')}
            className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedType === 'employee'
                ? 'border-[#1F2937] dark:border-white bg-white dark:bg-[#1a1a1a] shadow-lg'
                : 'border-[#E5E7EB] dark:border-[#333333] bg-white dark:bg-[#1a1a1a] hover:border-[#6B7280] dark:hover:border-[#9CA3AF]'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${
                selectedType === 'employee' 
                  ? 'bg-[#1F2937] dark:bg-white' 
                  : 'bg-[#F3F4F6] dark:bg-[#333333]'
              }`}>
                <FiUser className={`w-6 h-6 ${
                  selectedType === 'employee'
                    ? 'text-white dark:text-[#1F2937]'
                    : 'text-[#6B7280] dark:text-[#9CA3AF]'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white">
                  Employee
                </h3>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                  Submit reimbursements and manage your expenses
                </p>
              </div>
            </div>
          </button>

          {/* Admin Option */}
          <button
            onClick={() => setSelectedType('admin')}
            className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedType === 'admin'
                ? 'border-[#1F2937] dark:border-white bg-white dark:bg-[#1a1a1a] shadow-lg'
                : 'border-[#E5E7EB] dark:border-[#333333] bg-white dark:bg-[#1a1a1a] hover:border-[#6B7280] dark:hover:border-[#9CA3AF]'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${
                selectedType === 'admin' 
                  ? 'bg-[#1F2937] dark:bg-white' 
                  : 'bg-[#F3F4F6] dark:bg-[#333333]'
              }`}>
                <FiShield className={`w-6 h-6 ${
                  selectedType === 'admin'
                    ? 'text-white dark:text-[#1F2937]'
                    : 'text-[#6B7280] dark:text-[#9CA3AF]'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white">
                  Company Admin
                </h3>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                  Manage employees, approve reimbursements, and view reports
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Continue Button */}
        <div className="space-y-4">
          {selectedType && (
            <Link
              href={selectedType === 'employee' ? '/auth/login' : '/company/login'}
              className="w-full block bg-[#1F2937] dark:bg-white text-white dark:text-[#1F2937] py-3 px-6 rounded-xl font-medium text-center hover:bg-[#333333] dark:hover:bg-[#F3F4F6] transition-colors duration-200"
            >
              Continue as {selectedType === 'employee' ? 'Employee' : 'Company Admin'}
            </Link>
          )}
          
          {!selectedType && (
            <button
              disabled
              className="w-full bg-[#E5E7EB] dark:bg-[#333333] text-[#9CA3AF] dark:text-[#6B7280] py-3 px-6 rounded-xl font-medium cursor-not-allowed"
            >
              Select an account type to continue
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Don't have an account?{' '}
            <span className="text-[#1F2937] dark:text-white font-medium">
              You'll be able to sign up on the next page
            </span>
          </p>
        </div>
      </div>
    </div>
  );
} 