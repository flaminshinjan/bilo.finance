'use client';

import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiEye, FiSearch, FiFilter, FiCreditCard, FiUser, FiCalendar, FiDollarSign, FiRefreshCw, FiFileText } from 'react-icons/fi';
import { createClientSupabase } from '@/utils/supabase';

interface Reimbursement {
  id: string;
  employee_name: string;
  employee_email: string;
  business_purpose: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  invoice_id?: string;
  vendor_name?: string;
  invoice_number?: string;
  invoice_date?: string;
}

export default function ReimbursementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchReimbursements = async () => {
    try {
      if (!userId) {
        console.log('No user ID available for fetching reimbursements');
        return;
      }

      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/mastra/get-reimbursements?employeeId=${userId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch reimbursements');
      }
      
      setReimbursements(data.data.reimbursements);
      console.log(`✅ Loaded ${data.data.reimbursements.length} reimbursements`);
    } catch (err) {
      console.error('❌ Error fetching reimbursements:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reimbursements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getAuthenticatedUser = async () => {
      try {
        const supabase = createClientSupabase();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('No authenticated user found');
          setLoading(false);
          return;
        }

        setUserId(user.id);
      } catch (error) {
        console.error('Error getting authenticated user:', error);
        setLoading(false);
      }
    };

    getAuthenticatedUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchReimbursements();
    }
  }, [userId]);

  const getStatusColor = (status: string) => {
    return 'bg-[#F3F4F6] dark:bg-[#333333] text-[#1F2937] dark:text-white border border-[#E5E7EB] dark:border-[#555555]';
  };

  const filteredReimbursements = reimbursements.filter(reimbursement => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (reimbursement.business_purpose || '').toLowerCase().includes(searchLower) ||
      (reimbursement.vendor_name || '').toLowerCase().includes(searchLower) ||
      (reimbursement.invoice_number || '').toLowerCase().includes(searchLower);
    const matchesFilter = filter === 'all' || reimbursement.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: reimbursements.length,
    pending: reimbursements.filter(r => r.status === 'pending').length,
    approved: reimbursements.filter(r => r.status === 'approved').length,
    rejected: reimbursements.filter(r => r.status === 'rejected').length,
    totalAmount: reimbursements.reduce((sum, r) => sum + (r.amount || 0), 0),
    pendingAmount: reimbursements.filter(r => r.status === 'pending').reduce((sum, r) => sum + (r.amount || 0), 0)
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1F2937] dark:text-white">Reimbursements</h1>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-1">
              Manage and track all reimbursement requests
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#6B7280] dark:border-[#9CA3AF] border-t-transparent"></div>
            <span className="text-[#6B7280] dark:text-[#9CA3AF]">Loading reimbursements...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1F2937] dark:text-white">Reimbursements</h1>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-1">
              Manage and track all reimbursement requests
            </p>
          </div>
          <button
            onClick={fetchReimbursements}
            className="inline-flex items-center px-6 py-3 bg-[#1F2937] dark:bg-white text-white dark:text-[#1F2937] font-medium rounded-xl hover:bg-[#374151] dark:hover:bg-[#F3F4F6] transition-colors duration-200"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Retry
          </button>
        </div>
        <div className="bg-[#F3F4F6] dark:bg-[#333333] border border-[#E5E7EB] dark:border-[#555555] rounded-2xl p-8 text-center">
          <div className="bg-[#E5E7EB] dark:bg-[#555555] rounded-xl p-3 w-fit mx-auto mb-4">
            <FiCreditCard className="w-8 h-8 text-[#6B7280] dark:text-[#9CA3AF]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-2">
            Error Loading Reimbursements
          </h3>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-6">{error}</p>
          <button
            onClick={fetchReimbursements}
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
    <div className="space-y-8">


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-[#333333] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">Total Requests</p>
              <p className="text-3xl font-bold text-[#1F2937] dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiCreditCard className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-[#333333] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">Pending</p>
              <p className="text-3xl font-bold text-[#1F2937] dark:text-white">{stats.pending}</p>
            </div>
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiCalendar className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
          </div>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-medium">
            ${stats.pendingAmount.toLocaleString()} pending approval
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-[#333333] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">Approved</p>
              <p className="text-3xl font-bold text-[#1F2937] dark:text-white">{stats.approved}</p>
            </div>
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiCheck className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-[#333333] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-[#1F2937] dark:text-white">${stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-3">
              <FiDollarSign className="w-6 h-6 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#E5E7EB] dark:border-[#333333] p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search reimbursements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] dark:bg-[#333333] border border-[#E5E7EB] dark:border-[#555555] rounded-xl text-[#1F2937] dark:text-white placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF]" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-12 pr-10 py-3 bg-[#F8F9FA] dark:bg-[#333333] border border-[#E5E7EB] dark:border-[#555555] rounded-xl text-[#1F2937] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B7280] dark:focus:ring-[#9CA3AF] focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reimbursements Table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#E5E7EB] dark:border-[#333333] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8F9FA] dark:bg-[#333333]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#333333]">
              {filteredReimbursements.length > 0 ? (
                filteredReimbursements.map((reimbursement) => (
                  <tr key={reimbursement.id} className="hover:bg-[#F8F9FA] dark:hover:bg-[#333333]/20 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-lg p-2">
                          <FiCreditCard className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                        </div>
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-[#1F2937] dark:text-white truncate">
                            {reimbursement.business_purpose || 'No description'}
                          </div>
                          <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                            ID: {reimbursement.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#1F2937] dark:text-white">
                        {(reimbursement.currency || 'USD')} {(reimbursement.amount || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#1F2937] dark:text-white">
                        {reimbursement.invoice_number || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#1F2937] dark:text-white">
                        {reimbursement.vendor_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#1F2937] dark:text-white">
                        {new Date(reimbursement.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reimbursement.status)}`}>
                        {reimbursement.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-4">
                        <FiCreditCard className="w-8 h-8 text-[#6B7280] dark:text-[#9CA3AF] mx-auto" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-[#1F2937] dark:text-white mb-1">
                          No reimbursements found
                        </h3>
                        <p className="text-[#6B7280] dark:text-[#9CA3AF]">
                          {searchTerm || filter !== 'all' 
                            ? 'Try adjusting your search or filter criteria' 
                            : 'No reimbursement requests have been submitted yet'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 