'use client';

import { useState } from 'react';
import { FiCheck, FiX, FiEye, FiSearch, FiFilter, FiCreditCard, FiUser, FiCalendar, FiDollarSign } from 'react-icons/fi';

interface Reimbursement {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  status: 'approved' | 'pending' | 'rejected';
  description: string;
}

export default function ReimbursementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Placeholder data - replace with actual API call
  const reimbursements: Reimbursement[] = [
    {
      id: '1',
      date: '2024-02-20',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      amount: 250,
      status: 'pending',
      description: 'Office supplies'
    },
    {
      id: '2',
      date: '2024-02-19',
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      amount: 150,
      status: 'approved',
      description: 'Travel expenses'
    },
    {
      id: '3',
      date: '2024-02-18',
      employeeId: 'EMP003',
      employeeName: 'Mike Johnson',
      amount: 350,
      status: 'rejected',
      description: 'Software subscription'
    },
    {
      id: '4',
      date: '2024-02-17',
      employeeId: 'EMP004',
      employeeName: 'Sarah Wilson',
      amount: 75,
      status: 'pending',
      description: 'Parking fees'
    },
    {
      id: '5',
      date: '2024-02-16',
      employeeId: 'EMP005',
      employeeName: 'David Brown',
      amount: 120,
      status: 'approved',
      description: 'Client lunch meeting'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20';
      case 'pending':
        return 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20';
      case 'rejected':
        return 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20';
      default:
        return 'bg-[#6B7280]/10 text-[#6B7280] border border-[#6B7280]/20';
    }
  };

  const filteredReimbursements = reimbursements.filter(reimbursement => {
    const matchesSearch = 
      reimbursement.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reimbursement.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reimbursement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || reimbursement.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: reimbursements.length,
    pending: reimbursements.filter(r => r.status === 'pending').length,
    approved: reimbursements.filter(r => r.status === 'approved').length,
    rejected: reimbursements.filter(r => r.status === 'rejected').length,
    totalAmount: reimbursements.reduce((sum, r) => sum + r.amount, 0),
    pendingAmount: reimbursements.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0)
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937] dark:text-white">Reimbursements</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-1">
            {reimbursements.length > 0 ? `${reimbursements.length} total reimbursement requests` : 'No reimbursement requests found'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-[#374151] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">Total Requests</p>
              <p className="text-3xl font-bold text-[#1F2937] dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-[#8B5CF6]/10 rounded-xl p-3">
              <FiCreditCard className="w-6 h-6 text-[#8B5CF6]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-[#374151] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">Pending</p>
              <p className="text-3xl font-bold text-[#1F2937] dark:text-white">{stats.pending}</p>
            </div>
            <div className="bg-[#F59E0B]/10 rounded-xl p-3">
              <FiCalendar className="w-6 h-6 text-[#F59E0B]" />
            </div>
          </div>
          <p className="text-sm text-[#F59E0B] font-medium">
            ${stats.pendingAmount.toLocaleString()} pending approval
          </p>
        </div>

        <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-[#374151] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">Approved</p>
              <p className="text-3xl font-bold text-[#1F2937] dark:text-white">{stats.approved}</p>
            </div>
            <div className="bg-[#10B981]/10 rounded-xl p-3">
              <FiCheck className="w-6 h-6 text-[#10B981]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-[#374151] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-[#1F2937] dark:text-white">${stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-[#3B82F6]/10 rounded-xl p-3">
              <FiDollarSign className="w-6 h-6 text-[#3B82F6]" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by employee name, ID, or description..."
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
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reimbursements Content */}
      {filteredReimbursements.length === 0 ? (
        <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] p-12 text-center">
          <div className="bg-[#8B5CF6]/10 rounded-xl p-4 w-fit mx-auto mb-6">
            <FiCreditCard className="w-12 h-12 text-[#8B5CF6]" />
          </div>
          <h3 className="text-xl font-semibold text-[#1F2937] dark:text-white mb-2">
            {reimbursements.length === 0 ? 'No reimbursement requests' : 'No requests match your search'}
          </h3>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">
            {reimbursements.length === 0 
              ? 'Reimbursement requests will appear here when submitted' 
              : 'Try adjusting your search terms or filters'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] overflow-hidden">
          {/* Table Header */}
          <div className="bg-[#1F2937] text-white">
            <div className="grid grid-cols-6 gap-4 p-6">
              <div className="font-semibold text-sm uppercase tracking-wider">Date</div>
              <div className="font-semibold text-sm uppercase tracking-wider">Employee</div>
              <div className="font-semibold text-sm uppercase tracking-wider">Description</div>
              <div className="font-semibold text-sm uppercase tracking-wider">Amount</div>
              <div className="font-semibold text-sm uppercase tracking-wider">Status</div>
              <div className="font-semibold text-sm uppercase tracking-wider text-right">Actions</div>
            </div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-[#E5E7EB] dark:divide-[#374151]">
            {filteredReimbursements.map((reimbursement) => (
              <div key={reimbursement.id} className="grid grid-cols-6 gap-4 p-6 hover:bg-[#F8F9FA] dark:hover:bg-[#374151]/20 transition-colors duration-200">
                <div className="flex items-center">
                  <div className="flex items-center text-[#6B7280] dark:text-[#9CA3AF]">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {new Date(reimbursement.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-[#8B5CF6]/10 rounded-lg p-2 mr-3">
                    <FiUser className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <div className="font-medium text-[#1F2937] dark:text-white">
                      {reimbursement.employeeName}
                    </div>
                    <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      {reimbursement.employeeId}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="text-[#1F2937] dark:text-white">
                    {reimbursement.description}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="font-semibold text-[#1F2937] dark:text-white">
                    ${reimbursement.amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(reimbursement.status)}`}>
                    {reimbursement.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-end space-x-2">
                  <button className="p-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 rounded-lg transition-colors duration-200" title="View details">
                    <FiEye className="w-4 h-4" />
                  </button>
                  {reimbursement.status === 'pending' && (
                    <>
                      <button className="p-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#10B981] hover:bg-[#10B981]/10 rounded-lg transition-colors duration-200" title="Approve">
                        <FiCheck className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors duration-200" title="Reject">
                        <FiX className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 