'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiEye, FiTrash2, FiSearch, FiFilter, FiRefreshCw, FiFileText, FiCalendar } from 'react-icons/fi';

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

  useEffect(() => {
    fetchInvoices();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20';
      case 'approved':
        return 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20';
      case 'rejected':
        return 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20';
      case 'paid':
        return 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20';
      default:
        return 'bg-[#6B7280]/10 text-[#6B7280] border border-[#6B7280]/20';
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1F2937] dark:text-white">Invoices</h1>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-1">
              Manage and track all your invoices
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#8B5CF6] border-t-transparent"></div>
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
            className="inline-flex items-center px-6 py-3 bg-[#8B5CF6] text-white font-medium rounded-xl hover:bg-[#7C3AED] transition-colors duration-200"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Retry
          </button>
        </div>
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-2xl p-8 text-center">
          <div className="bg-[#EF4444]/10 rounded-xl p-3 w-fit mx-auto mb-4">
            <FiFileText className="w-8 h-8 text-[#EF4444]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white mb-2">
            Error Loading Invoices
          </h3>
          <p className="text-[#EF4444] mb-6">{error}</p>
          <button
            onClick={fetchInvoices}
            className="inline-flex items-center px-6 py-3 bg-[#8B5CF6] text-white font-medium rounded-xl hover:bg-[#7C3AED] transition-colors duration-200"
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937] dark:text-white">
            Invoices
          </h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-1">
            {invoices.length > 0 ? `${invoices.length} total invoices` : 'No invoices found'}
          </p>
        </div>
        <button
          onClick={fetchInvoices}
          className="inline-flex items-center px-6 py-3 bg-[#8B5CF6] text-white font-medium rounded-xl hover:bg-[#7C3AED] transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          <FiRefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by invoice number or vendor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-[#F8F9FA] dark:bg-[#374151] text-[#1F2937] dark:text-white placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-colors duration-200"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#8B5CF6]/10 rounded-xl p-2">
              <FiFilter className="text-[#8B5CF6] w-5 h-5" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-[#F8F9FA] dark:bg-[#374151] text-[#1F2937] dark:text-white py-3 px-4 focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-colors duration-200"
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

      {/* Invoices Content */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] p-12 text-center">
          <div className="bg-[#8B5CF6]/10 rounded-xl p-4 w-fit mx-auto mb-6">
            <FiFileText className="w-12 h-12 text-[#8B5CF6]" />
          </div>
          <h3 className="text-xl font-semibold text-[#1F2937] dark:text-white mb-2">
            {invoices.length === 0 ? 'No invoices uploaded yet' : 'No invoices match your search'}
          </h3>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-6">
            {invoices.length === 0 
              ? 'Get started by uploading your first invoice' 
              : 'Try adjusting your search terms or filters'}
          </p>
          {invoices.length === 0 && (
            <a
              href="/dashboard/upload"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Upload Your First Invoice
            </a>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] overflow-hidden">
          {/* Table Header */}
          <div className="bg-[#1F2937] text-white">
            <div className="grid grid-cols-6 gap-4 p-6">
              <div className="font-semibold text-sm uppercase tracking-wider">Invoice No</div>
              <div className="font-semibold text-sm uppercase tracking-wider">Vendor</div>
              <div className="font-semibold text-sm uppercase tracking-wider">Amount</div>
              <div className="font-semibold text-sm uppercase tracking-wider">Date</div>
              <div className="font-semibold text-sm uppercase tracking-wider">Status</div>
              <div className="font-semibold text-sm uppercase tracking-wider text-right">Actions</div>
            </div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-[#E5E7EB] dark:divide-[#374151]">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="grid grid-cols-6 gap-4 p-6 hover:bg-[#F8F9FA] dark:hover:bg-[#374151]/20 transition-colors duration-200">
                <div className="flex items-center">
                  <div className="bg-[#8B5CF6]/10 rounded-lg p-2 mr-3">
                    <FiFileText className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <span className="font-medium text-[#1F2937] dark:text-white">
                    {invoice.invoice_number}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <div>
                    <div className="font-medium text-[#1F2937] dark:text-white">
                      {invoice.vendor_name}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="font-semibold text-[#1F2937] dark:text-white">
                    {invoice.currency} {invoice.amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <div className="flex items-center text-[#6B7280] dark:text-[#9CA3AF]">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-end space-x-2">
                  <button className="p-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 rounded-lg transition-colors duration-200">
                    <FiEye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 rounded-lg transition-colors duration-200">
                    <FiDownload className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors duration-200">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 