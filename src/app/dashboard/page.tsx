'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FiUpload, 
  FiFileText, 
  FiDollarSign, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle,
  FiTrendingUp,
  FiActivity,
  FiArrowRight,
  FiCalendar,
  FiUsers,
  FiZap,
  FiPieChart,
  FiBarChart,
  FiTarget,
  FiShield,
  FiGlobe,
  FiMail,
  FiDownload,
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';

interface DashboardStats {
  totalInvoices: number;
  pendingInvoices: number;
  processedInvoices: number;
  totalAmount: number;
  reimbursementsPending: number;
  reimbursementsProcessed: number;
  monthlyInvoices: number;
  monthlyAmount: number;
  avgProcessingTime: number;
  successRate: number;
}

interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
  amount?: number;
}

interface PendingTask {
  title: string;
  priority: string;
  time: string;
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    pendingInvoices: 0,
    processedInvoices: 0,
    totalAmount: 0,
    reimbursementsPending: 0,
    reimbursementsProcessed: 0,
    monthlyInvoices: 0,
    monthlyAmount: 0,
    avgProcessingTime: 0,
    successRate: 0,
  });

  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/mastra/dashboard');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }
      
      setStats(data.data.statistics);
      setRecentActivity(data.data.recentActivity);
      setPendingTasks(data.data.pendingTasks);
      setInsights(data.data.insights);
      
      console.log('✅ Dashboard data loaded successfully');
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Upload New Invoice',
      description: 'Upload a PDF or image of your invoice',
      icon: FiUpload,
      href: '/dashboard/upload',
      primary: true
    },
    {
      title: 'View All Invoices',
      description: 'Manage and track all your invoices',
      icon: FiFileText,
      href: '/dashboard/invoices'
    },
    {
      title: 'Process Reimbursements',
      description: 'Review and process pending reimbursements',
      icon: FiDollarSign,
      href: '/dashboard/reimbursements'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF]" />;
      case 'approved':
      case 'completed':
        return <FiCheckCircle className="w-5 h-5 text-[#374151] dark:text-[#D1D5DB]" />;
      case 'rejected':
      case 'error':
        return <FiAlertCircle className="w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF]" />;
      default:
        return null;
    }
  };

  const statsCards = [
    {
      title: 'Total Invoices',
      value: stats.totalInvoices,
      icon: FiFileText,
      subStats: [
        { label: 'Processed', value: stats.processedInvoices },
        { label: 'Pending', value: stats.pendingInvoices }
      ]
    },
    {
      title: 'Total Amount',
      value: `$${stats.totalAmount.toLocaleString()}`,
      icon: FiTrendingUp,
      subText: `From ${stats.totalInvoices} invoices`,
      change: stats.totalAmount > 50000 ? '+12.5%' : '+5.2%'
    },
    {
      title: 'Reimbursements',
      value: stats.reimbursementsProcessed,
      icon: FiDollarSign,
      subText: `${stats.reimbursementsPending} pending approvals`
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: FiTarget,
      subText: 'Processing accuracy',
      change: stats.successRate > 95 ? '+2.1%' : '+1.2%'
    }
  ];

  const monthlyStats = [
    {
      title: 'This Month',
      value: stats.monthlyInvoices,
      subtitle: 'Invoices',
      icon: FiCalendar,
      amount: `$${stats.monthlyAmount.toLocaleString()}`
    },
    {
      title: 'Avg Processing',
      value: `${stats.avgProcessingTime}h`,
      subtitle: 'Time',
      icon: FiClock,
      trend: stats.avgProcessingTime < 3 ? 'Fast processing' : 'Standard time'
    },
    {
      title: 'System Status',
      value: 'Online',
      subtitle: 'All systems',
      icon: FiShield,
      status: 'Running smoothly'
    }
  ];

  const integrationStatus = [
    { name: 'Database', status: 'connected', lastSync: 'Real-time', icon: FiBarChart },
    { name: 'AI Processing', status: 'connected', lastSync: 'Active', icon: FiZap },
    { name: 'File Storage', status: 'connected', lastSync: 'Synced', icon: FiGlobe },
    { name: 'Notifications', status: 'connected', lastSync: 'Enabled', icon: FiMail }
  ];

  if (loading) {
    return (
      <div className="space-y-6">

        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#6B7280] dark:border-[#9CA3AF] border-t-transparent"></div>
            <span className="text-[#6B7280] dark:text-[#9CA3AF]">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">

        <div className="bg-[#F3F4F6] dark:bg-[#333333] border border-[#E5E7EB] dark:border-[#555555] rounded-2xl p-8 text-center">
          <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center px-6 py-3 bg-[#1F2937] dark:bg-white text-white dark:text-[#1F2937] font-medium rounded-xl hover:bg-[#333333] dark:hover:bg-[#F3F4F6] transition-colors duration-200"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">


      {/* Monthly Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {monthlyStats.map((stat, index) => (
          <div key={index} className="bg-[#1F2937] dark:bg-[#333333] rounded-2xl p-6 text-white dark:text-[#F9FAFB] shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/10 dark:bg-white/20 rounded-xl p-2">
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-sm opacity-80">{stat.title}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold">{stat.value}</span>
                <span className="text-sm opacity-80">{stat.subtitle}</span>
              </div>
              {stat.amount && (
                <p className="text-sm opacity-90">{stat.amount}</p>
              )}
              {stat.trend && (
                <p className="text-sm opacity-90">{stat.trend}</p>
              )}
              {stat.status && (
                <p className="text-sm opacity-90">{stat.status}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-[#333333] p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
            <div>
                <p className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                  {card.title}
                </p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold text-[#1F2937] dark:text-white">
                    {card.value}
                  </p>
                  {card.change && (
                    <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                      {card.change}
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
                <card.icon className="w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF]" />
              </div>
            </div>
            
            {card.subStats && (
              <div className="flex items-center justify-between text-sm">
                {card.subStats.map((stat, idx) => (
                  <div key={idx}>
                    <span className="text-[#6B7280] dark:text-[#9CA3AF] font-medium">
                      {stat.value} {stat.label.toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {card.subText && (
              <div className="text-sm">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">
                  {card.subText}
                </span>
            </div>
            )}
          </div>
        ))}
        </div>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-[#333333]">
            <div className="p-6 border-b border-[#E5E7EB] dark:border-[#333333]">
          <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-2">
                    <FiClock className="w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white">
                    Pending Tasks
                  </h3>
                </div>
                <Link href="/dashboard/invoices" className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-[#D1D5DB] text-sm font-medium">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {pendingTasks.length > 0 ? pendingTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F9FA] dark:hover:bg-[#333333]/20 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'high' ? 'bg-[#1F2937] dark:bg-[#D1D5DB]' :
                        task.priority === 'medium' ? 'bg-[#6B7280] dark:bg-[#9CA3AF]' : 'bg-[#9CA3AF] dark:bg-[#6B7280]'
                      }`} />
                      <span className="text-sm text-[#1F2937] dark:text-white">{task.title}</span>
                    </div>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] bg-[#F3F4F6] dark:bg-[#333333] px-2 py-1 rounded-full">
                      {task.time}
                    </span>
            </div>
                )) : (
                  <div className="text-center py-8">
                    <FiCheckCircle className="w-12 h-12 text-[#6B7280] dark:text-[#9CA3AF] mx-auto mb-3" />
                    <p className="text-[#6B7280] dark:text-[#9CA3AF]">All tasks completed!</p>
                  </div>
                )}
          </div>
            </div>
          </div>
        </div>

        {/* Integration Status */}
            <div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-[#333333]">
            <div className="p-6 border-b border-[#E5E7EB] dark:border-[#333333]">
              <div className="flex items-center space-x-3">
                <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-2">
                  <FiZap className="w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white">
                  System Status
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {integrationStatus.map((integration, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-lg p-2">
                        <integration.icon className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1F2937] dark:text-white">
                          {integration.name}
                        </p>
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                          {integration.lastSync}
                        </p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#1F2937] dark:bg-[#D1D5DB]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-[#1F2937] dark:text-white mb-6">
          Quick Actions
        </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
              className={`group block p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                action.primary 
                  ? 'bg-[#1F2937] dark:bg-[#333333] border-transparent text-white dark:text-[#F9FAFB]' 
                  : 'bg-white dark:bg-[#1a1a1a] border-[#E5E7EB] dark:border-[#333333] hover:border-[#6B7280] dark:hover:border-[#9CA3AF]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${
                    action.primary 
                      ? 'bg-white/10 dark:bg-white/20' 
                      : 'bg-[#F3F4F6] dark:bg-[#333333]'
              }`}>
                    <action.icon className={`w-6 h-6 ${
                      action.primary ? 'text-white dark:text-[#F9FAFB]' : 'text-[#6B7280] dark:text-[#9CA3AF]'
                    }`} />
              </div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    action.primary 
                      ? 'text-white dark:text-[#F9FAFB]' 
                      : 'text-[#1F2937] dark:text-white'
                  }`}>
                  {action.title}
                </h3>
                  <p className={`text-sm ${
                    action.primary 
                      ? 'text-white/80 dark:text-[#F9FAFB]/80' 
                      : 'text-[#6B7280] dark:text-[#9CA3AF]'
                  }`}>
                  {action.description}
                </p>
              </div>
                <FiArrowRight className={`w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0 transition-all duration-200 ${
                  action.primary ? 'text-white dark:text-[#F9FAFB]' : 'text-[#6B7280] dark:text-[#9CA3AF]'
                }`} />
            </div>
          </Link>
        ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-[#333333]">
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#333333]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-2">
                <FiActivity className="w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white">
                Recent Activity
              </h3>
            </div>
            <Link href="/dashboard/invoices" className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-[#D1D5DB] text-sm font-medium">
              View all
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-[#F8F9FA] dark:hover:bg-[#333333]/20 transition-colors duration-200">
                <div className="mt-1">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#1F2937] dark:text-white truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] ml-2">
                      {activity.timestamp}
                    </p>
                  </div>
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] truncate">
                    {activity.description}
                  </p>
                  {activity.amount && (
                    <p className="text-sm font-medium text-[#1F2937] dark:text-[#D1D5DB]">
                      ${activity.amount.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <FiActivity className="w-12 h-12 text-[#6B7280] dark:text-[#9CA3AF] mx-auto mb-3" />
                <p className="text-[#6B7280] dark:text-[#9CA3AF]">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-[#1F2937] dark:bg-[#333333] rounded-2xl p-6 text-white dark:text-[#F9FAFB]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-white/10 dark:bg-white/20 rounded-xl p-2">
              <FiPieChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">Insights</h3>
          </div>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <p key={index} className="text-sm opacity-90">
                • {insight}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 