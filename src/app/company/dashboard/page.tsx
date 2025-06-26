'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiDollarSign, FiClock, FiTrendingUp, FiFileText, FiCalendar } from 'react-icons/fi';

interface DashboardData {
  statistics: {
    totalEmployees: number;
    totalReimbursements: number;
    pendingReimbursements: number;
    approvedReimbursements: number;
    rejectedReimbursements: number;
    totalAmount: number;
    approvedAmount: number;
    pendingAmount: number;
    approvalRate: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    amount: number;
    status: string;
    timestamp: string;
    employee: string;
  }>;
  monthlyStats: Array<{
    month: string;
    totalAmount: number;
    requestCount: number;
    approvedCount: number;
  }>;
  employees: Array<{
    id: string;
    full_name: string;
    email: string;
    created_at: string;
  }>;
  pendingRequests: Array<{
    id: string;
    employee: string;
    amount: number;
    description: string;
    category: string;
    created_at: string;
    receipt_url?: string;
  }>;
}

export default function CompanyDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyAuth, setCompanyAuth] = useState<any>(null);

  useEffect(() => {
    // Get company auth from localStorage
    const authData = localStorage.getItem('companyAuth');
    if (authData) {
      const parsedAuth = JSON.parse(authData);
      setCompanyAuth(parsedAuth);
      fetchDashboardData(parsedAuth.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async (companyId: string) => {
    try {
      const response = await fetch(`/api/company/dashboard?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-[#6B7280] dark:text-[#9CA3AF]';
      case 'pending':
        return 'text-[#6B7280] dark:text-[#9CA3AF]';
      case 'rejected':
        return 'text-[#6B7280] dark:text-[#9CA3AF]';
      default:
        return 'text-[#6B7280] dark:text-[#9CA3AF]';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[#F3F4F6] dark:bg-[#333333] rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-[#F3F4F6] dark:bg-[#333333] rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B7280] dark:text-[#9CA3AF]">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1F2937] dark:text-white">
          Welcome back, {companyAuth?.companyName || 'Admin'}
        </h1>
        <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2">
          Here's what's happening with your company today
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiUsers className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                {dashboardData.statistics.totalEmployees}
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Total Employees</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiClock className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                {dashboardData.statistics.pendingReimbursements}
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Pending Requests</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiDollarSign className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                {formatCurrency(dashboardData.statistics.totalAmount)}
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Total Amount</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiTrendingUp className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                {dashboardData.statistics.approvalRate}%
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Approval Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-6">Recent Activity</h3>
          
          <div className="space-y-4">
            {dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-[#F8F9FA] dark:bg-[#333333] rounded-xl">
                  <div className="bg-[#1F2937] dark:bg-[#555555] rounded-full p-2">
                    <FiFileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1F2937] dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">
                No recent activity
              </p>
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-6">Pending Requests</h3>
          
          <div className="space-y-4">
            {dashboardData.pendingRequests.length > 0 ? (
              dashboardData.pendingRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-[#F8F9FA] dark:bg-[#333333] rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#1F2937] dark:bg-[#555555] rounded-full p-2">
                      <FiDollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1F2937] dark:text-white">{request.employee}</p>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{request.category}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-[#1F2937] dark:text-white">
                      {formatCurrency(request.amount)}
                    </p>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      {formatDate(request.created_at)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">
                No pending requests
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-6">Monthly Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {dashboardData.monthlyStats.map((month, index) => (
            <div key={index} className="bg-[#F8F9FA] dark:bg-[#333333] rounded-xl p-4">
              <div className="text-center">
                <div className="bg-[#1F2937] dark:bg-[#555555] rounded-full p-2 mx-auto mb-3 w-10 h-10 flex items-center justify-center">
                  <FiCalendar className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-medium text-[#1F2937] dark:text-white mb-1">{month.month}</h4>
                <p className="text-sm font-bold text-[#1F2937] dark:text-white">
                  {formatCurrency(month.totalAmount)}
                </p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  {month.requestCount} requests
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 