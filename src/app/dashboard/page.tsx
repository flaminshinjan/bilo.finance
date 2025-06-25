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
  FiFilter
} from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';

export default function DashboardPage() {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
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

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'invoice_uploaded',
      title: 'New Invoice Uploaded',
      description: 'Invoice #INV-2024-001 uploaded for processing',
      timestamp: '2 minutes ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'reimbursement_processed',
      title: 'Reimbursement Processed',
      description: 'Reimbursement #RB-2024-003 processed successfully',
      timestamp: '1 hour ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'invoice_error',
      title: 'Processing Error',
      description: 'Invoice #INV-2024-002 requires manual review',
      timestamp: '2 hours ago',
      status: 'error'
    }
  ]);

  // Placeholder data - replace with actual API calls
  useEffect(() => {
    setStats({
      totalInvoices: 45,
      pendingInvoices: 12,
      processedInvoices: 33,
      totalAmount: 67250,
      reimbursementsPending: 8,
      reimbursementsProcessed: 37,
      monthlyInvoices: 18,
      monthlyAmount: 24580,
      avgProcessingTime: 2.4,
      successRate: 97.8,
    });
  }, []);

  const quickActions = [
    {
      title: 'Upload New Invoice',
      description: 'Upload a PDF or image of your invoice',
      icon: FiUpload,
      href: '/dashboard/upload',
      primary: true,
      gradient: true
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
        return <FiClock className="w-5 h-5 text-[#F59E0B]" />;
      case 'completed':
        return <FiCheckCircle className="w-5 h-5 text-[#10B981]" />;
      case 'error':
        return <FiAlertCircle className="w-5 h-5 text-[#EF4444]" />;
      default:
        return null;
    }
  };

  const statsCards = [
    {
      title: 'Total Invoices',
      value: stats.totalInvoices,
      icon: FiFileText,
      iconBg: 'bg-[#8B5CF6]/10',
      iconColor: 'text-[#8B5CF6]',
      subStats: [
        { label: 'Processed', value: stats.processedInvoices, color: 'text-[#10B981]' },
        { label: 'Pending', value: stats.pendingInvoices, color: 'text-[#F59E0B]' }
      ]
    },
    {
      title: 'Total Amount',
      value: `$${stats.totalAmount.toLocaleString()}`,
      icon: FiTrendingUp,
      iconBg: 'bg-[#10B981]/10',
      iconColor: 'text-[#10B981]',
      subText: `From ${stats.totalInvoices} invoices`,
      change: '+12.5%',
      changeColor: 'text-[#10B981]'
    },
    {
      title: 'Reimbursements',
      value: stats.reimbursementsProcessed,
      icon: FiDollarSign,
      iconBg: 'bg-[#3B82F6]/10',
      iconColor: 'text-[#3B82F6]',
      subText: `${stats.reimbursementsPending} pending approvals`,
      subTextColor: 'text-[#F59E0B]'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: FiTarget,
      iconBg: 'bg-[#10B981]/10',
      iconColor: 'text-[#10B981]',
      subText: 'Processing accuracy',
      change: '+2.1%',
      changeColor: 'text-[#10B981]'
    }
  ];

  const monthlyStats = [
    {
      title: 'This Month',
      value: stats.monthlyInvoices,
      subtitle: 'Invoices',
      icon: FiCalendar,
      color: 'bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA]',
      amount: `$${stats.monthlyAmount.toLocaleString()}`
    },
    {
      title: 'Avg Processing',
      value: `${stats.avgProcessingTime}h`,
      subtitle: 'Time',
      icon: FiClock,
      color: 'bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]',
      trend: '-15% faster'
    },
    {
      title: 'Active Users',
      value: '24',
      subtitle: 'Team Members',
      icon: FiUsers,
      color: 'bg-gradient-to-r from-[#10B981] to-[#34D399]',
      status: '6 online now'
    }
  ];

  const pendingTasks = [
    { title: 'Review expense report #ER-2024-089', priority: 'high', time: '2h' },
    { title: 'Approve reimbursement for John Doe', priority: 'medium', time: '4h' },
    { title: 'Update vendor information', priority: 'low', time: '1d' },
    { title: 'Process bulk invoice upload', priority: 'high', time: '30m' },
    { title: 'Generate monthly reports', priority: 'medium', time: '3h' }
  ];

  const integrationStatus = [
    { name: 'QuickBooks', status: 'connected', lastSync: '2 min ago', icon: FiBarChart },
    { name: 'Slack', status: 'connected', lastSync: '1 hour ago', icon: FiMail },
    { name: 'Google Drive', status: 'warning', lastSync: 'Sync failed', icon: FiGlobe },
    { name: 'Zapier', status: 'connected', lastSync: '5 min ago', icon: FiZap }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937] dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-1">
            Welcome back! Here's what's happening with your invoices.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-[#1A1A2E] border border-[#E5E7EB] dark:border-[#374151] text-[#374151] dark:text-white font-medium rounded-xl hover:shadow-md transition-all duration-200">
            <FiDownload className="mr-2 h-4 w-4" />
            Export
          </button>
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 dark:focus:ring-offset-[#1A1A2E]"
          >
            <FiUpload className="mr-2 h-5 w-5" />
            Upload Invoice
          </Link>
        </div>
      </div>

      {/* Monthly Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {monthlyStats.map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200`}>
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 rounded-xl p-2">
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
          <div key={index} className="bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-[#374151] p-6 hover:shadow-lg transition-all duration-200">
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
                    <span className={`text-xs font-medium ${card.changeColor}`}>
                      {card.change}
                    </span>
                  )}
                </div>
              </div>
              <div className={`${card.iconBg} rounded-xl p-3`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
            
            {card.subStats && (
              <div className="flex items-center justify-between text-sm">
                {card.subStats.map((stat, idx) => (
                  <div key={idx}>
                    <span className={`${stat.color} font-medium`}>
                      {stat.value} {stat.label.toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {card.subText && (
              <div className="text-sm">
                <span className={card.subTextColor || 'text-[#6B7280] dark:text-[#9CA3AF]'}>
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
          <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-[#374151]">
            <div className="p-6 border-b border-[#E5E7EB] dark:border-[#374151]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#F59E0B]/10 rounded-xl p-2">
                    <FiClock className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white">
                    Pending Tasks
                  </h3>
                </div>
                <button className="text-[#8B5CF6] hover:text-[#7C3AED] text-sm font-medium">
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {pendingTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F9FA] dark:hover:bg-[#374151]/20 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'high' ? 'bg-[#EF4444]' :
                        task.priority === 'medium' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                      }`} />
                      <span className="text-sm text-[#1F2937] dark:text-white">{task.title}</span>
                    </div>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] bg-[#F3F4F6] dark:bg-[#374151] px-2 py-1 rounded-full">
                      {task.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Integration Status */}
        <div>
          <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-[#374151]">
            <div className="p-6 border-b border-[#E5E7EB] dark:border-[#374151]">
              <div className="flex items-center space-x-3">
                <div className="bg-[#8B5CF6]/10 rounded-xl p-2">
                  <FiZap className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white">
                  Integrations
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {integrationStatus.map((integration, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-[#F3F4F6] dark:bg-[#374151] rounded-lg p-2">
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
                    <div className={`w-2 h-2 rounded-full ${
                      integration.status === 'connected' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
                    }`} />
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
                  ? 'bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] border-transparent text-white' 
                  : 'bg-white dark:bg-[#1A1A2E] border-[#E5E7EB] dark:border-[#374151] hover:border-[#8B5CF6]/30 dark:hover:border-[#8B5CF6]/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${
                    action.primary 
                      ? 'bg-white/10' 
                      : 'bg-[#8B5CF6]/10'
                  }`}>
                    <action.icon className={`w-6 h-6 ${
                      action.primary ? 'text-white' : 'text-[#8B5CF6]'
                    }`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    action.primary 
                      ? 'text-white' 
                      : 'text-[#1F2937] dark:text-white'
                  }`}>
                    {action.title}
                  </h3>
                  <p className={`text-sm ${
                    action.primary 
                      ? 'text-white/80' 
                      : 'text-[#6B7280] dark:text-[#9CA3AF]'
                  }`}>
                    {action.description}
                  </p>
                </div>
                <FiArrowRight className={`w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0 transition-all duration-200 ${
                  action.primary ? 'text-white' : 'text-[#8B5CF6]'
                }`} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-[#374151]">
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#374151]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-[#8B5CF6]/10 rounded-xl p-2">
                <FiActivity className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <h2 className="text-xl font-semibold text-[#1F2937] dark:text-white">
                Recent Activity
              </h2>
            </div>
            <Link 
              href="/dashboard/invoices" 
              className="text-[#8B5CF6] hover:text-[#7C3AED] text-sm font-medium transition-colors duration-200"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-[#F8F9FA] dark:hover:bg-[#374151]/20 transition-colors duration-200">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1F2937] dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                    {activity.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] bg-[#F3F4F6] dark:bg-[#374151] px-2 py-1 rounded-full">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 