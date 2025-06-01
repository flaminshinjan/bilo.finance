'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiUpload, FiFileText, FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
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
    });
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
        return <FiClock className="w-5 h-5 text-yellow-500" />;
      case 'completed':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <Link
          href="/dashboard/upload"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900"
        >
          <FiUpload className="mr-2 -ml-1 h-5 w-5" />
          Upload Invoice
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invoices</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats.totalInvoices}</p>
            </div>
            <div className="bg-primary/10 rounded-full p-3">
              <FiFileText className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              <span className="text-green-600 dark:text-green-400 font-medium">{stats.processedInvoices} processed</span>
            </div>
            <div>
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">{stats.pendingInvoices} pending</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                ${stats.totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-3">
              <FiDollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              From {stats.totalInvoices} invoices
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reimbursements</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {stats.reimbursementsProcessed}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-3">
              <FiDollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
              {stats.reimbursementsPending} pending approvals
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow
              ${action.primary ? 'ring-2 ring-primary dark:ring-primary/50' : ''}`}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${
                action.primary 
                  ? 'bg-primary/10 text-primary'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                <action.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {action.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h2>
          <div className="mt-6 flow-root">
            <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="py-5">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                      {activity.timestamp}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 