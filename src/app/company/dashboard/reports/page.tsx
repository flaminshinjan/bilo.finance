'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiTrendingUp, FiDollarSign, FiCalendar, FiUsers, FiBarChart } from 'react-icons/fi';

interface ReportData {
  monthlyData: {
    month: string;
    totalAmount: number;
    requestCount: number;
    approvalRate: number;
  }[];
  departmentData: {
    department: string;
    totalAmount: number;
    requestCount: number;
    averageAmount: number;
  }[];
  categoryData: {
    category: string;
    totalAmount: number;
    requestCount: number;
    percentage: number;
  }[];
  summary: {
    totalSpending: number;
    totalRequests: number;
    overallApprovalRate: number;
    averageProcessingTime: number;
  };
}

export default function CompanyReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
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
      fetchReportData();
    }
  }, [selectedPeriod, companyAuth]);

  const fetchReportData = async () => {
    try {
      if (!companyAuth?.id) {
        console.error('No company ID available');
        return;
      }

      setLoading(true);
      
      const response = await fetch(
        `/api/company/reports?companyId=${companyAuth.id}&period=${selectedPeriod}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
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

  if (!reportData) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937] dark:text-white">Reports & Analytics</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2">
            Financial insights and reimbursement analytics
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-xl bg-[#F8F9FA] dark:bg-[#333333] text-[#1F2937] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#1F2937] dark:bg-white text-white dark:text-[#1F2937] rounded-xl hover:bg-[#333333] dark:hover:bg-[#F3F4F6] transition-colors duration-200">
            <FiDownload className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiDollarSign className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                {formatCurrency(reportData.summary.totalSpending)}
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Total Spending</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiBarChart className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                {reportData.summary.totalRequests}
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Total Requests</p>
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
                {reportData.summary.overallApprovalRate}%
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Approval Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiCalendar className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                {reportData.summary.averageProcessingTime}d
              </p>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Avg Processing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trends */}
        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-6">Monthly Trends</h3>
          
          <div className="space-y-4">
            {reportData.monthlyData.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between p-4 bg-[#F8F9FA] dark:bg-[#333333] rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#1F2937] dark:bg-[#555555] rounded-lg p-2 min-w-[48px] text-center">
                    <span className="text-white text-sm font-medium">{month.month}</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#1F2937] dark:text-white">
                      {formatCurrency(month.totalAmount)}
                    </p>
                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      {month.requestCount} requests
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-[#1F2937] dark:text-white">
                    {month.approvalRate}%
                  </p>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">approval</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-6">Department Breakdown</h3>
          
          <div className="space-y-4">
            {reportData.departmentData.map((dept) => (
              <div key={dept.department} className="flex items-center justify-between p-4 bg-[#F8F9FA] dark:bg-[#333333] rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#1F2937] dark:bg-[#555555] rounded-full p-2">
                    <FiUsers className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1F2937] dark:text-white">{dept.department}</p>
                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      {dept.requestCount} requests
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-[#1F2937] dark:text-white">
                    {formatCurrency(dept.totalAmount)}
                  </p>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                    Avg: {formatCurrency(dept.averageAmount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-6">Expense Categories</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {reportData.categoryData.map((category) => (
            <div key={category.category} className="bg-[#F8F9FA] dark:bg-[#333333] rounded-xl p-4">
              <div className="text-center">
                <div className="bg-[#1F2937] dark:bg-[#555555] rounded-full p-3 mx-auto mb-3 w-12 h-12 flex items-center justify-center">
                  <FiDollarSign className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-medium text-[#1F2937] dark:text-white mb-1">{category.category}</h4>
                <p className="text-lg font-bold text-[#1F2937] dark:text-white mb-1">
                  {formatCurrency(category.totalAmount)}
                </p>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                  {category.requestCount} requests
                </p>
                <div className="w-full bg-[#E5E7EB] dark:bg-[#555555] rounded-full h-2 mb-2">
                  <div 
                    className="bg-[#1F2937] dark:bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  {category.percentage}% of total
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 