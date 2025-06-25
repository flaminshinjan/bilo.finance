'use client';

import { useState } from 'react';
import { FiSave, FiUpload, FiSettings, FiBell, FiKey, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState({
    name: 'Tech Corp',
    email: 'billing@techcorp.com',
    phone: '+1 (555) 123-4567',
    address: '123 Tech Street, Silicon Valley, CA 94025',
    taxId: 'TAX123456789'
  });

  const [notifications, setNotifications] = useState({
    newInvoice: true,
    invoiceProcessed: true,
    reimbursementRequest: true,
    monthlyReport: false
  });

  const [apiSettings, setApiSettings] = useState({
    stripeEnabled: true,
    resendEnabled: true,
    webhookUrl: 'https://api.techcorp.com/webhook/bilo',
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const notificationLabels = {
    newInvoice: {
      title: 'New Invoice Uploaded',
      description: 'Get notified when a new invoice is uploaded for processing'
    },
    invoiceProcessed: {
      title: 'Invoice Processed',
      description: 'Receive notifications when invoice processing is completed'
    },
    reimbursementRequest: {
      title: 'Reimbursement Request',
      description: 'Get alerts for new reimbursement requests requiring approval'
    },
    monthlyReport: {
      title: 'Monthly Report',
      description: 'Receive monthly summary reports of invoice processing activity'
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937] dark:text-white">Settings</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-1">
            Manage your company profile and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 dark:focus:ring-offset-[#1A1A2E] disabled:opacity-50 disabled:transform-none"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <FiSave className="mr-2 h-5 w-5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Company Profile */}
      <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] shadow-sm">
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#374151]">
          <div className="flex items-center space-x-3">
            <div className="bg-[#8B5CF6]/10 rounded-xl p-3">
              <FiUser className="w-6 h-6 text-[#8B5CF6]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1F2937] dark:text-white">Company Profile</h2>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                Update your company information and contact details
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-[#1F2937] dark:text-white">
                <FiUser className="w-4 h-4" />
                <span>Company Name</span>
              </label>
              <input
                type="text"
                value={companyProfile.name}
                onChange={(e) => setCompanyProfile({ ...companyProfile, name: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-[#F8F9FA] dark:bg-[#374151] text-[#1F2937] dark:text-white px-4 py-3 focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-colors duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-[#1F2937] dark:text-white">
                <FiMail className="w-4 h-4" />
                <span>Email</span>
              </label>
              <input
                type="email"
                value={companyProfile.email}
                onChange={(e) => setCompanyProfile({ ...companyProfile, email: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-[#F8F9FA] dark:bg-[#374151] text-[#1F2937] dark:text-white px-4 py-3 focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-colors duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-[#1F2937] dark:text-white">
                <FiPhone className="w-4 h-4" />
                <span>Phone</span>
              </label>
              <input
                type="tel"
                value={companyProfile.phone}
                onChange={(e) => setCompanyProfile({ ...companyProfile, phone: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-[#F8F9FA] dark:bg-[#374151] text-[#1F2937] dark:text-white px-4 py-3 focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-colors duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-[#1F2937] dark:text-white">
                <FiKey className="w-4 h-4" />
                <span>Tax ID</span>
              </label>
              <input
                type="text"
                value={companyProfile.taxId}
                onChange={(e) => setCompanyProfile({ ...companyProfile, taxId: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-[#F8F9FA] dark:bg-[#374151] text-[#1F2937] dark:text-white px-4 py-3 focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-colors duration-200"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-[#1F2937] dark:text-white">
                <FiMapPin className="w-4 h-4" />
                <span>Address</span>
              </label>
              <textarea
                value={companyProfile.address}
                onChange={(e) => setCompanyProfile({ ...companyProfile, address: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-[#F8F9FA] dark:bg-[#374151] text-[#1F2937] dark:text-white px-4 py-3 focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-colors duration-200 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] shadow-sm">
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#374151]">
          <div className="flex items-center space-x-3">
            <div className="bg-[#3B82F6]/10 rounded-xl p-3">
              <FiBell className="w-6 h-6 text-[#3B82F6]" />
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
              <div key={key} className="flex items-center justify-between p-4 bg-[#F8F9FA] dark:bg-[#374151] rounded-xl border border-[#E5E7EB] dark:border-[#4B5563]">
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
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 dark:focus:ring-offset-[#1A1A2E] ${
                    value ? 'bg-[#8B5CF6]' : 'bg-[#E5E7EB] dark:bg-[#4B5563]'
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

      {/* API Settings */}
      <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] shadow-sm">
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#374151]">
          <div className="flex items-center space-x-3">
            <div className="bg-[#10B981]/10 rounded-xl p-3">
              <FiSettings className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1F2937] dark:text-white">API & Integrations</h2>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                Manage your API settings and third-party integrations
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#1F2937] dark:text-white">
              Webhook URL
            </label>
            <input
              type="url"
              value={apiSettings.webhookUrl}
              onChange={(e) => setApiSettings({ ...apiSettings, webhookUrl: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-[#F8F9FA] dark:bg-[#374151] text-[#1F2937] dark:text-white px-4 py-3 focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-colors duration-200"
              placeholder="https://your-domain.com/webhook"
            />
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Webhook endpoint to receive invoice processing notifications
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#F8F9FA] dark:bg-[#374151] rounded-xl border border-[#E5E7EB] dark:border-[#4B5563]">
              <div className="flex items-center space-x-3">
                <div className="bg-[#6366F1]/10 rounded-lg p-2">
                  <svg className="w-5 h-5 text-[#6366F1]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm4.64-.5c.13.14.28.24.44.28L12 13.5l4.92-1.72c.16-.04.31-.14.44-.28.13-.14.2-.32.16-.5-.04-.18-.16-.34-.32-.42L12 8 6.8 10.58c-.16.08-.28.24-.32.42-.04.18.03.36.16.5z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2937] dark:text-white">Stripe Integration</h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Enable Stripe for payment processing and invoice management</p>
                </div>
              </div>
              <button
                onClick={() => setApiSettings({ ...apiSettings, stripeEnabled: !apiSettings.stripeEnabled })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 dark:focus:ring-offset-[#1A1A2E] ${
                  apiSettings.stripeEnabled ? 'bg-[#8B5CF6]' : 'bg-[#E5E7EB] dark:bg-[#4B5563]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    apiSettings.stripeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-[#F8F9FA] dark:bg-[#374151] rounded-xl border border-[#E5E7EB] dark:border-[#4B5563]">
              <div className="flex items-center space-x-3">
                <div className="bg-[#EF4444]/10 rounded-lg p-2">
                  <FiMail className="w-5 h-5 text-[#EF4444]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2937] dark:text-white">Resend Integration</h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Enable Resend for email notifications and communication</p>
                </div>
              </div>
              <button
                onClick={() => setApiSettings({ ...apiSettings, resendEnabled: !apiSettings.resendEnabled })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 dark:focus:ring-offset-[#1A1A2E] ${
                  apiSettings.resendEnabled ? 'bg-[#8B5CF6]' : 'bg-[#E5E7EB] dark:bg-[#4B5563]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    apiSettings.resendEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 