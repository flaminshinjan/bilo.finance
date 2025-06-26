'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiSettings, FiBell, FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiSearch, FiCheck } from 'react-icons/fi';
import { supabase } from '@/utils/supabase';

interface Company {
  id: string;
  company_name: string;
  email: string;
  contact_name: string;
  phone?: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  department: string;
  company_id: string | null;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [showCompanySearch, setShowCompanySearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '',
    email: '',
    full_name: '',
    phone: '',
    department: '',
    company_id: null
  });

  const [notifications, setNotifications] = useState({
    reimbursementApproved: true,
    reimbursementRejected: true,
    invoiceProcessed: true,
    monthlyReport: false
  });

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (user) {
          setCurrentUserId(user.id);
          fetchUserProfile(user.id);
          fetchCompanies();
        } else {
          // No authenticated user - redirect to login
          window.location.href = '/auth/login';
        }
      } catch (error) {
        console.error('Error getting user:', error);
        window.location.href = '/auth/login';
      }
    }

    getUser();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoadingProfile(true);
      const response = await fetch(`/api/profile?userId=${userId}`);
      
      if (response.status === 401) {
        // Not authenticated - redirect to login
        window.location.href = '/auth/login';
        return;
      }
      
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
        setSelectedCompanyId(profile.company_id || '');
      } else {
        console.error('Failed to fetch user profile');
        setSaveMessage('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setSaveMessage('Error loading profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await fetch('/api/companies');
      
      if (response.ok) {
        const companiesData = await response.json();
        setCompanies(companiesData);
      } else {
        console.error('Failed to fetch companies');
        setSaveMessage('Failed to load companies');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setSaveMessage('Error loading companies');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveMessage('');
    
    try {
      // Validate required fields
      if (!userProfile.email || !userProfile.full_name) {
        setSaveMessage('Email and full name are required');
        setLoading(false);
        return;
      }

      const updatedProfile = {
        ...userProfile,
        company_id: selectedCompanyId || null
      };
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });
      
      if (response.ok) {
        const savedProfile = await response.json();
        setUserProfile(savedProfile);
        setSaveMessage('Settings saved successfully!');
        
        // Refresh the profile data to show what was actually saved
        if (currentUserId) {
          await fetchUserProfile(currentUserId);
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setSaveMessage(errorData.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setShowCompanySearch(false);
    setSearchQuery('');
  };

  const filteredCompanies = companies.filter(company =>
    company.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  const notificationLabels = {
    reimbursementApproved: {
      title: 'Reimbursement Approved',
      description: 'Get notified when your reimbursement request is approved'
    },
    reimbursementRejected: {
      title: 'Reimbursement Rejected',
      description: 'Get notified when your reimbursement request is rejected'
    },
    invoiceProcessed: {
      title: 'Invoice Processed',
      description: 'Receive notifications when your invoices are processed'
    },
    monthlyReport: {
      title: 'Monthly Summary',
      description: 'Receive monthly summary of your reimbursement activity'
    }
  };

  if (loadingProfile || loadingCompanies) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[#F3F4F6] dark:bg-[#333333] rounded w-1/4 mb-6"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-[#F3F4F6] dark:bg-[#333333] rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1F2937] dark:text-white">Settings</h1>
        <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2">
          Manage your profile, company association, and notification preferences
        </p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-xl ${
          saveMessage.includes('successfully') 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Company Selection */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#E5E7EB] dark:border-[#333333] shadow-sm">
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#333333]">
          <div className="flex items-center space-x-3">
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiHome className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1F2937] dark:text-white">Company Association</h2>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                Select the company you work for to submit reimbursements
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {selectedCompany ? (
              <div className="flex items-center justify-between p-4 bg-[#F8F9FA] dark:bg-[#333333] rounded-xl border border-[#E5E7EB] dark:border-[#555555]">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#1F2937] dark:bg-[#555555] rounded-lg p-2">
                    <FiHome className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1F2937] dark:text-white">
                      {selectedCompany.company_name}
                    </h3>
                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      {selectedCompany.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCheck className="w-5 h-5 text-green-500" />
                  <button
                    onClick={() => setShowCompanySearch(true)}
                    className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <FiHome className="w-8 h-8 text-[#6B7280] dark:text-[#9CA3AF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-2">
                  No Company Selected
                </h3>
                <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-4">
                  Select a company to start submitting reimbursements
                </p>
                <button
                  onClick={() => setShowCompanySearch(true)}
                  className="px-4 py-2 bg-[#1F2937] dark:bg-white text-white dark:text-[#1F2937] rounded-xl hover:bg-[#333333] dark:hover:bg-[#F3F4F6] transition-colors duration-200"
                >
                  Select Company
                </button>
              </div>
            )}

            {showCompanySearch && (
              <div className="border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-4 bg-[#F8F9FA] dark:bg-[#333333]">
                <div className="relative mb-4">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] dark:border-[#555555] rounded-lg bg-white dark:bg-[#1a1a1a] text-[#1F2937] dark:text-white focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => handleCompanySelect(company.id)}
                        className="w-full text-left p-3 rounded-lg hover:bg-white dark:hover:bg-[#1a1a1a] border border-transparent hover:border-[#E5E7EB] dark:hover:border-[#555555] transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-[#1F2937] dark:bg-[#555555] rounded-lg p-2">
                            <FiHome className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-[#1F2937] dark:text-white">
                              {company.company_name}
                            </h4>
                            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                              {company.email}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-[#6B7280] dark:text-[#9CA3AF]">
                      No companies found matching your search
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-[#E5E7EB] dark:border-[#555555]">
                  <button
                    onClick={() => setShowCompanySearch(false)}
                    className="px-4 py-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#E5E7EB] dark:border-[#333333] shadow-sm">
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#333333]">
          <div className="flex items-center space-x-3">
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiUser className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1F2937] dark:text-white">User Profile</h2>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                Update your personal information
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-[#1F2937] dark:text-white">
                <FiUser className="w-4 h-4" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={userProfile.full_name}
                onChange={(e) => setUserProfile({ ...userProfile, full_name: e.target.value })}
                placeholder="Enter your full name"
                required
                className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#333333] bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white px-4 py-3 focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-[#6B7280] dark:focus:border-[#9CA3AF] transition-colors duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-[#1F2937] dark:text-white">
                <FiMail className="w-4 h-4" />
                <span>Email</span>
              </label>
              <input
                type="email"
                value={userProfile.email}
                onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                placeholder="Enter your email address"
                required
                className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#333333] bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white px-4 py-3 focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-[#6B7280] dark:focus:border-[#9CA3AF] transition-colors duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-[#1F2937] dark:text-white">
                <FiPhone className="w-4 h-4" />
                <span>Phone</span>
              </label>
              <input
                type="tel"
                value={userProfile.phone}
                onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                placeholder="Enter your phone number"
                className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#333333] bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white px-4 py-3 focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-[#6B7280] dark:focus:border-[#9CA3AF] transition-colors duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-[#1F2937] dark:text-white">
                <FiMapPin className="w-4 h-4" />
                <span>Department</span>
              </label>
              <input
                type="text"
                value={userProfile.department}
                onChange={(e) => setUserProfile({ ...userProfile, department: e.target.value })}
                placeholder="e.g., Engineering, Sales, Marketing"
                className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#333333] bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white px-4 py-3 focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-[#6B7280] dark:focus:border-[#9CA3AF] transition-colors duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#E5E7EB] dark:border-[#333333] shadow-sm">
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#333333]">
          <div className="flex items-center space-x-3">
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiBell className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1F2937] dark:text-white">Notification Preferences</h2>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                Configure when and how you want to be notified
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-[#F8F9FA] dark:bg-[#333333] rounded-xl border border-[#E5E7EB] dark:border-[#555555]">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#1F2937] dark:text-white">
                    {notificationLabels[key as keyof typeof notificationLabels].title}
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                    {notificationLabels[key as keyof typeof notificationLabels].description}
                  </p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [key]: !value })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:ring-offset-2 dark:focus:ring-offset-[#1a1a1a] ${
                    value ? 'bg-[#1F2937] dark:bg-[#D1D5DB]' : 'bg-[#E5E7EB] dark:bg-[#555555]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      value ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-3 bg-[#1F2937] dark:bg-white text-white dark:text-[#1F2937] rounded-xl hover:bg-[#333333] dark:hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <FiSave className="w-4 h-4" />
          <span>{loading ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
} 