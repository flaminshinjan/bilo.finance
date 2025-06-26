'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiEye, FiTrash2, FiSearch, FiFilter, FiRefreshCw, FiFileText, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { createClientSupabase } from '@/utils/supabase';

interface Invoice {
  id: string;
  invoice_number: string;
  vendor_name: string;
  vendor_address?: string;
  amount: number;
  currency: string;
  invoice_date: string;
  due_date?: string;
  status: string;
  extracted_data?: any;
  created_at: string;
  created_by: string;
}

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reimbursing, setReimbursing] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/invoices');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch invoices');
      }
      
      setInvoices(data.invoices);
      console.log(`✅ Loaded ${data.invoices.length} invoices`);
    } catch (err) {
      console.error('❌ Error fetching invoices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleReimburse = async (invoice: Invoice) => {
    try {
      if (!userId) {
        alert('User not authenticated. Please refresh the page and try again.');
        return;
      }
      
      if (!userProfile) {
        alert('Profile not loaded. Please complete your profile in settings before submitting reimbursements.');
        return;
      }

      setReimbursing(invoice.id);
      
      const response = await fetch('/api/mastra/submit-reimbursement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          employeeId: userId,
          employeeName: userProfile.full_name || 'Current User',
          employeeEmail: userProfile.email || 'user@company.com',
          reimbursementAmount: invoice.amount,
          currency: invoice.currency,
          businessPurpose: `Reimbursement for invoice ${invoice.invoice_number}`,
          vendorName: invoice.vendor_name,
          invoiceDate: invoice.invoice_date,
          invoiceNumber: invoice.invoice_number
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit reimbursement');
      }
      
      alert(`✅ Reimbursement submitted successfully! Reference: ${data.data.reimbursementId}`);
    } catch (err) {
      console.error('❌ Error submitting reimbursement:', err);
      alert(`❌ Failed to submit reimbursement: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setReimbursing(null);
    }
  };

  useEffect(() => {
    const getAuthenticatedUser = async () => {
      try {
        const supabase = createClientSupabase();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('No authenticated user found');
          return;
        }

        setUserId(user.id);

        // Fetch user profile
        const response = await fetch(`/api/profile?userId=${user.id}`);
        if (response.ok) {
          const profileData = await response.json();
          console.log('Profile data loaded:', profileData);
          setUserProfile(profileData); // Profile data is returned directly, not wrapped
        } else {
          console.error('Failed to fetch profile:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error getting authenticated user:', error);
      }
    };

    getAuthenticatedUser();
    fetchInvoices();
  }, []);

  const getStatusColor = (status: string) => {
    return 'bg-[#F3F4F6] dark:bg-[#333333] text-[#1F2937] dark:text-white border border-[#E5E7EB] dark:border-[#555555]';
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || invoice.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-8">

        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#6B7280] dark:border-[#9CA3AF] border-t-transparent"></div>
            <span className="text-[#6B7280] dark:text-[#9CA3AF]">Loading invoices...</span>
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
            <h1 className="text-3xl font-bold text-[#1F2937] dark:text-white">Invoices</h1>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-1">
              Manage and track all your invoices
            </p>
          </div>
          <button
            onClick={fetchInvoices}
            className="inline-flex items-center px-6 py-3 bg-[#1F2937] dark:bg-white text-white dark:text-[#1F2937] font-medium rounded-xl hover:bg-[#374151] dark:hover:bg-[#F3F4F6] transition-colors duration-200"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Retry
          </button>
        </div>
        <div className="bg-[#F3F4F6] dark:bg-[#333333] border border-[#E5E7EB] dark:border-[#555555] rounded-2xl p-8 text-center">
          <div className="bg-[#E5E7EB] dark:bg-[#555555] rounded-xl p-3 w-fit mx-auto mb-4">
            <FiFileText className="w-8 h-8 text-[#6B7280] dark:text-[#9CA3AF]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-2">
            Error Loading Invoices
          </h3>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-6">{error}</p>
          <button
            onClick={fetchInvoices}
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


      {/* Search and Filter */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#E5E7EB] dark:border-[#333333] p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search invoices..."
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
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#E5E7EB] dark:border-[#333333] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8F9FA] dark:bg-[#333333]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Reimburse
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#333333]">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                                      <tr key={invoice.id} className="hover:bg-[#F8F9FA] dark:hover:bg-[#333333]/20 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-lg p-2">
                          <FiFileText className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#1F2937] dark:text-white">
                            {invoice.invoice_number}
                          </div>
                          <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                            ID: {invoice.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#1F2937] dark:text-white">
                        {invoice.vendor_name}
                      </div>
                      {invoice.vendor_address && (
                        <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF] truncate max-w-xs">
                          {invoice.vendor_address}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#1F2937] dark:text-white">
                        {invoice.currency} {(invoice.amount || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#1F2937] dark:text-white">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </div>
                      {invoice.due_date && (
                        <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                          Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleReimburse(invoice)}
                        disabled={reimbursing === invoice.id}
                        className="inline-flex items-center px-3 py-1.5 bg-[#1F2937] dark:bg-white text-white dark:text-[#1F2937] text-xs font-medium rounded-lg hover:bg-[#333333] dark:hover:bg-[#F3F4F6] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reimbursing === invoice.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border border-white dark:border-[#1F2937] border-t-transparent mr-1"></div>
                        ) : (
                          <FiDollarSign className="w-3 h-3 mr-1" />
                        )}
                        {reimbursing === invoice.id ? 'Processing...' : 'Reimburse'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white transition-colors duration-200">
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white transition-colors duration-200">
                          <FiDownload className="w-4 h-4" />
                        </button>
                        <button className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white transition-colors duration-200">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="bg-[#F3F4F6] dark:bg-[#333333] rounded-xl p-4">
                        <FiFileText className="w-8 h-8 text-[#6B7280] dark:text-[#9CA3AF] mx-auto" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-[#1F2937] dark:text-white mb-1">
                          No invoices found
                        </h3>
                        <p className="text-[#6B7280] dark:text-[#9CA3AF]">
                          {searchTerm || filter !== 'all' 
                            ? 'Try adjusting your search or filter criteria' 
                            : 'Upload your first invoice to get started'}
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