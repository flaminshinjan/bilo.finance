'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiEdit3, FiMail, FiPhone, FiMapPin, FiDollarSign, FiUsers, FiSettings } from 'react-icons/fi';

export default function CompanySettingsPage() {
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: ''
  });

  const [reimbursementSettings, setReimbursementSettings] = useState({
    maxAmount: 5000,
    requireReceipts: true,
    autoApproveUnder: 100,
    approvalWorkflow: 'manager_only',
    categories: ['Travel', 'Meals', 'Office Supplies', 'Training', 'Equipment']
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newRequestAlerts: true,
    approvalReminders: true,
    monthlyReports: true,
    expenseAlerts: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companyAuth, setCompanyAuth] = useState<any>(null);

  useEffect(() => {
    // Get company auth data
    const authData = localStorage.getItem('companyAuth');
    if (authData) {
      try {
        const parsedAuth = JSON.parse(authData);
        setCompanyAuth(parsedAuth);
      } catch (error) {
        console.error('Error parsing company auth data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (companyAuth?.id) {
      fetchSettings();
    }
  }, [companyAuth]);

  const fetchSettings = async () => {
    try {
      if (!companyAuth?.id) {
        console.error('No company ID available');
        return;
      }

      setLoading(true);
      
      const response = await fetch(`/api/company/settings?companyId=${companyAuth.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const data = await response.json();
      setCompanyInfo(data.companyInfo);
      setReimbursementSettings(data.reimbursementSettings);
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      if (!companyAuth?.id) {
        console.error('No company ID available');
        return;
      }

      const response = await fetch(`/api/company/settings?companyId=${companyAuth.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyInfo,
          reimbursementSettings,
          notifications
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setIsEditing(false);
      // Show success message (you could add a toast here)
    } catch (error) {
      console.error('Error saving settings:', error);
      // Show error message
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[#F3F4F6] dark:bg-[#333333] rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-[#F3F4F6] dark:bg-[#333333] rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937] dark:text-white">Company Settings</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2">
            Manage your organization's profile and reimbursement configurations
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white border border-[#E5E7EB] dark:border-[#333333] rounded-xl hover:bg-[#F3F4F6] dark:hover:bg-[#333333] transition-colors duration-200"
            >
              <FiEdit3 className="w-4 h-4" />
              <span>Edit Settings</span>
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-[#1F2937] dark:bg-white text-white dark:text-[#1F2937] rounded-xl hover:bg-[#333333] dark:hover:bg-[#F3F4F6] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Company Profile */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
            <FiUsers className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1F2937] dark:text-white">Company Profile</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-xl bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] w-4 h-4" />
              <input
                type="email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                disabled={!isEditing}
                className="w-full pl-10 pr-3 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-xl bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
              Phone Number
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] w-4 h-4" />
              <input
                type="tel"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                disabled={!isEditing}
                className="w-full pl-10 pr-3 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-xl bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
              Website
            </label>
            <input
              type="url"
              value={companyInfo.website}
              onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-xl bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent disabled:opacity-60"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
              Address
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-[#6B7280] dark:text-[#9CA3AF] w-4 h-4" />
              <textarea
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                disabled={!isEditing}
                rows={2}
                className="w-full pl-10 pr-3 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-xl bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent disabled:opacity-60"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
              Description
            </label>
            <textarea
              value={companyInfo.description}
              onChange={(e) => setCompanyInfo({...companyInfo, description: e.target.value})}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-xl bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Reimbursement Settings */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
            <FiDollarSign className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1F2937] dark:text-white">Reimbursement Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
              Maximum Reimbursement Amount
            </label>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] w-4 h-4" />
              <input
                type="number"
                value={reimbursementSettings.maxAmount}
                onChange={(e) => setReimbursementSettings({...reimbursementSettings, maxAmount: Number(e.target.value)})}
                disabled={!isEditing}
                className="w-full pl-10 pr-3 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-xl bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
              Auto-approve Amount (Under)
            </label>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] w-4 h-4" />
              <input
                type="number"
                value={reimbursementSettings.autoApproveUnder}
                onChange={(e) => setReimbursementSettings({...reimbursementSettings, autoApproveUnder: Number(e.target.value)})}
                disabled={!isEditing}
                className="w-full pl-10 pr-3 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-xl bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2">
              Approval Workflow
            </label>
            <select
              value={reimbursementSettings.approvalWorkflow}
              onChange={(e) => setReimbursementSettings({...reimbursementSettings, approvalWorkflow: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-xl bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent disabled:opacity-60"
            >
              <option value="manager_only">Manager Only</option>
              <option value="manager_hr">Manager + HR</option>
              <option value="finance_only">Finance Only</option>
              <option value="multi_level">Multi-level Approval</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="requireReceipts"
              checked={reimbursementSettings.requireReceipts}
              onChange={(e) => setReimbursementSettings({...reimbursementSettings, requireReceipts: e.target.checked})}
              disabled={!isEditing}
              className="w-5 h-5 text-[#1F2937] bg-[#F8F9FA] dark:bg-[#333333] border-[#E5E7EB] dark:border-[#555555] rounded focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:ring-2 disabled:opacity-60"
            />
            <label htmlFor="requireReceipts" className="text-sm font-medium text-[#1F2937] dark:text-white">
              Require Receipt Uploads
            </label>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
            <FiSettings className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1F2937] dark:text-white">Notification Settings</h2>
        </div>

        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-[#F8F9FA] dark:bg-[#333333] rounded-xl">
              <div>
                <h4 className="text-sm font-medium text-[#1F2937] dark:text-white">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                  {key === 'emailNotifications' && 'Receive notifications via email'}
                  {key === 'newRequestAlerts' && 'Get notified when new reimbursement requests are submitted'}
                  {key === 'approvalReminders' && 'Receive reminders for pending approvals'}
                  {key === 'monthlyReports' && 'Get monthly summary reports'}
                  {key === 'expenseAlerts' && 'Alerts for high-value expense requests'}
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#E5E7EB] dark:bg-[#555555] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6B7280]/20 dark:peer-focus:ring-[#9CA3AF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1F2937] dark:peer-checked:bg-white disabled:opacity-60"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 